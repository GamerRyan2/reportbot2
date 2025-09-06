require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActivityType, MessageFlags } = require('discord.js');
const { createCanvas, registerFont } = require('canvas');
const { checkMessage, loadBlacklist, saveBlacklist, normalize } = require('./utils/antibestemmie');
const config = require('./config.json');

// Registra font personalizzato
registerFont(path.join(__dirname, 'fonts', 'Roboto-Italic-VariableFont_wdth,wght.ttf'), { family: 'SansCustom' });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: ['CHANNEL']
});

client.commands = new Collection();
const captchaMap = new Map();

// ===== Caricamento comandi =====
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.data.name, command);
    });

// ===== Bot pronto =====
client.once('ready', () => {
    console.log(`✅ Bot loggato come ${client.user.tag}`);
    let i = 0;
    setInterval(() => {
        const status = config.statusList[i];
        client.user.setPresence({
            activities: [{ name: status.text, type: ActivityType[status.type] }],
            status: status.presence
        });
        i = (i + 1) % config.statusList.length;
    }, config.statusInterval || 10000);
});

// ===== Funzione captcha =====
function generateCaptchaText(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// ===== InteractionCreate =====
client.on('interactionCreate', async interaction => {
    try {
        // ----- COMANDI SLASH -----
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
            return;
        }

        // ----- PULSANTI CAPTCHA -----
        if (interaction.isButton() && interaction.customId.startsWith('captcha_')) {
            if (interaction.customId === 'captcha_verify_start') {
                const captchaText = generateCaptchaText(6);
                captchaMap.set(interaction.user.id, captchaText);

                const canvas = createCanvas(200, 80);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#2b2d31';
                ctx.fillRect(0, 0, 200, 80);
                ctx.font = '36px SansCustom';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(captchaText, 40, 50);

                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'captcha.png' });
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('captcha_open_modal')
                        .setLabel('Inserisci codice')
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.reply({
                    content: '🔍 Inserisci il codice mostrato nell\'immagine qui sotto:',
                    files: [attachment],
                    components: [row],
                    flags: MessageFlags.Ephemeral
                });
            } else if (interaction.customId === 'captcha_open_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('captcha_modal_submit')
                    .setTitle('Verifica Captcha')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('captcha_input')
                                .setLabel('Scrivi qui il codice')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal);
            }
            return;
        }

        // ----- MODAL CAPTCHA -----
        if (interaction.isModalSubmit() && interaction.customId === 'captcha_modal_submit') {
            const userInput = interaction.fields.getTextInputValue('captcha_input').trim();
            const storedCaptcha = captchaMap.get(interaction.user.id);

            if (storedCaptcha && userInput === storedCaptcha) {
                captchaMap.delete(interaction.user.id);
                const role = interaction.guild.roles.cache.get(config.verifyRoleId);
                if (role) {
                    const member = await interaction.guild.members.fetch(interaction.user.id);
                    await member.roles.add(role);
                }
                await interaction.reply({ content: '✅ Verifica completata con successo!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: '❌ Codice errato. Riprova.', flags: MessageFlags.Ephemeral });
            }
            return;
        }

        // ----- PULSANTI REPORT -----
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('verify_')) return; // skip captcha

            try {
                const row = new ActionRowBuilder().addComponents(
                    ...interaction.message.components[0].components.map(btn =>
                        ButtonBuilder.from(btn).setDisabled(true)
                    )
                );
                await interaction.message.edit({ components: [row] });
            } catch (err) {
                console.error("Errore disabilitando pulsanti:", err);
            }

            const [action, reporterId, targetId, ...reasonParts] = interaction.customId.split('_');
            let motivo = decodeURIComponent(reasonParts.join('_')) || 'Nessun motivo fornito';
            if (motivo.length > 1024) motivo = motivo.slice(0, 1021) + '...';

            if (action === 'accetta') {
                const modal = new ModalBuilder()
                    .setCustomId(`modal_accetta_${reporterId}_${targetId}_${encodeURIComponent(motivo)}`)
                    .setTitle('Opzioni accettazione report');
                const anonInput = new TextInputBuilder()
                    .setCustomId('anonimo')
                    .setLabel('Vuoi che il reporter sia anonimo? (Yes / No)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Yes o No')
                    .setRequired(true);
                const row = new ActionRowBuilder().addComponents(anonInput);
                modal.addComponents(row);
                return interaction.showModal(modal);
            }

            if (action === 'rifiuta') {
                try {
                    const reporter = await client.users.fetch(reporterId);
                    const rejectEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('⚠️ Report rifiutato ⚠️')
                        .setDescription('Lo staff ha deciso di non procedere con la segnalazione.')
                        .addFields({ name: 'Report preso in considerazione da', value: `${interaction.user}` });
                    await reporter.send({ embeds: [rejectEmbed] });
                    await interaction.reply({ content: '❌ Report rifiutato e notificato al reporter.', ephemeral: true });
                } catch (err) {
                    console.error(err);
                    await interaction.reply({ content: 'Errore nell\'invio del messaggio al reporter.', ephemeral: true });
                }
            }
            return;
        }

        // ----- MODAL REPORT -----
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_accetta_')) {
            const parts = interaction.customId.split('_');
            const reporterId = parts[2];
            const targetId = parts[3];
            let motivo = decodeURIComponent(parts.slice(4).join('_'));
            if (motivo.length > 1024) motivo = motivo.slice(0, 1021) + '...';
            const anonChoice = interaction.fields.getTextInputValue('anonimo').trim().toLowerCase();

            try {
                const reporter = await client.users.fetch(reporterId);
                const target = await client.users.fetch(targetId);

                const warnEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('⚠️ Sei stato warnato ⚠️')
                    .setDescription('È stata inviata una nuova segnalazione allo staff.')
                    .addFields(
                        { name: 'Segnalato da', value: anonChoice === 'yes' ? 'Anonimo' : `${reporter}` },
                        { name: 'Motivo', value: motivo },
                        { name: 'Report preso in considerazione da', value: `${interaction.user}` }
                    );

                const acceptEmbed = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('⚠️ Il tuo report è stato preso in considerazione ⚠️')
                    .setDescription('Lo staff ha accettato la tua segnalazione.')
                    .addFields({ name: 'Report preso in considerazione da', value: `${interaction.user}` });

                await target.send({ embeds: [warnEmbed] });
                await reporter.send({ embeds: [acceptEmbed] });
                await interaction.reply({ content: '✅ Report accettato e notifiche inviate.', ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: 'Errore nell\'invio delle notifiche.', ephemeral: true });
            }
            return;
        }

    } catch (err) {
        console.error("[INTERACTION ERROR]", err);
        if (!interaction.replied) await interaction.reply({ content: '❌ Errore durante l\'interazione.', ephemeral: true });
    }
});

// ===== Filtro bestemmie =====
client.on('messageCreate', async message => {
    await checkMessage(message);
});

// ===== Login =====
client.login(process.env.TOKEN);
