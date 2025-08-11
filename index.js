require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
    Client,
    GatewayIntentBits,
    Collection,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActivityType,
    MessageFlags
} = require('discord.js');
const { createCanvas, registerFont } = require('canvas'); // ← AGGIUNTO registerFont
const config = require('./config.json');

// Registra il font personalizzato per evitare l'errore Fontconfig
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

// Caricamento comandi
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.data.name, command);
    });

// Bot pronto
client.once('ready', () => {
    console.log(`✅ Bot loggato come ${client.user.tag}`);
    let i = 0;
    setInterval(() => {
        const status = config.statusList[i];
        client.user.setPresence({
            activities: [{
                name: status.text,
                type: ActivityType[status.type]
            }],
            status: status.presence
        });
        i = (i + 1) % config.statusList.length;
    }, config.statusInterval || 10000);
});

// Funzione per generare testo captcha
function generateCaptchaText(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// Gestione interazioni
client.on('interactionCreate', async interaction => {
    // Comandi slash
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Errore nell\'esecuzione del comando.', flags: MessageFlags.Ephemeral });
            }
        }
    }

    // Bottone: avvio captcha
    if (interaction.isButton() && interaction.customId === 'captcha_verify_start') {
        const captchaText = generateCaptchaText(6);
        captchaMap.set(interaction.user.id, captchaText);

        const canvas = createCanvas(200, 80);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2b2d31';
        ctx.fillRect(0, 0, 200, 80);
        ctx.font = '36px SansCustom'; // ← Usa il font registrato
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
    }

    // Bottone: apri modal per captcha
    if (interaction.isButton() && interaction.customId === 'captcha_open_modal') {
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

    // Modal: invio codice captcha
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
    }
});

client.login(process.env.TOKEN);
