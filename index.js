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
    ActivityType // <-- aggiunto qui
} = require('discord.js');
const { createCanvas } = require('canvas');

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaText = '';
    for (let i = 0; i < 6; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const canvas = createCanvas(240, 100);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise lines
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Text
    ctx.font = 'bold 42px Sans';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2);

    return { image: canvas.toBuffer(), text: captchaText };
}

const config = require('./config.json');

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

// Carica comandi
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Bot pronto
client.once('ready', () => {
    console.log(`✅ Bot loggato come ${client.user.tag}`);
    let i = 0;
    setInterval(() => {
        const status = config.statusList[i];
        client.user.setPresence({
            activities: [{
                name: status.text,
                type: ActivityType[status.type] // usa ActivityType invece di stringa pura
            }],
            status: status.presence
        });
        i = (i + 1) % config.statusList.length;
    }, config.statusInterval || 10000);
});

// Gestione interazioni
client.on('interactionCreate', async interaction => {
    // Comandi
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Errore nell\'eseguire il comando!', ephemeral: true });
            }
        }
    }

    // Captcha
    
    if (interaction.isButton() && interaction.customId === 'captcha_verify_start') {
        // Genera un captcha leggibile di 6 caratteri (alfanumerico)
        const { image, text } = generateCaptcha();
        captchaMap.set(interaction.user.id, text);
        const attachment = new AttachmentBuilder(image, { name: 'captcha.png' });

        // Invia l'immagine captcha all'utente in modo ephemeral, poi mostra il modal
        await interaction.reply({
            content: 'Inserisci il codice del captcha qui sotto:',
            files: [attachment],
            ephemeral: true
        }).catch(() => {});

        const modal = new ModalBuilder()
            .setCustomId('captcha_modal')
            .setTitle('Verifica Captcha');

        const input = new TextInputBuilder()
            .setCustomId('captcha_input')
            .setLabel('Inserisci il codice captcha')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }


    if (interaction.isModalSubmit() && interaction.customId === 'captcha_modal') {
        const userCaptcha = interaction.fields.getTextInputValue('captcha_input').trim().toUpperCase();
        const realCaptcha = captchaMap.get(interaction.user.id);

        if (userCaptcha === realCaptcha) {
            const role = interaction.guild.roles.cache.get(config.verifyRoleId);
            if (role) {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                await member.roles.add(role);
            }
            captchaMap.delete(interaction.user.id);
            await interaction.reply({ content: '✅ Verifica completata con successo!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Codice captcha errato. Riprova.', ephemeral: true });
        }
    }

    // Pulsanti report
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('accetta_') || interaction.customId.startsWith('rifiuta_')) {
            const [action, reporterId, targetId] = interaction.customId.split('_');
            const message = interaction.message;

            // Disabilita pulsanti
            const disabledRow = ActionRowBuilder.from(message.components[0]);
            disabledRow.components.forEach(btn => btn.setDisabled(true));

            await message.edit({ components: [disabledRow] });

            const reporter = await interaction.client.users.fetch(reporterId);
            const target = await interaction.client.users.fetch(targetId);

            if (action === 'accetta') {
                // DM al segnalato
                const dmToTarget = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('⚠️ Sei stato segnalato')
                    .setDescription(`Un moderatore ha preso in considerazione una segnalazione sul tuo conto.`)
                    .addFields(
                        { name: 'Moderatore', value: `${interaction.user}`, inline: false }
                    )
                    .setTimestamp();
                await target.send({ embeds: [dmToTarget] }).catch(() => {});

                // DM al reporter
                const dmToReporter = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('📩 Il tuo report è stato preso in considerazione')
                    .setDescription(`Lo staff ha accettato la tua segnalazione.`)
                    .addFields(
                        { name: 'Staffer', value: `${interaction.user}`, inline: false }
                    )
                    .setTimestamp();
                await reporter.send({ embeds: [dmToReporter] }).catch(() => {});

                await interaction.reply({ content: '✅ Report preso in considerazione.', ephemeral: true });
            }

            if (action === 'rifiuta') {
                // DM al reporter
                const dmToReporter = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('📩 Il tuo report è stato rifiutato')
                    .setDescription(`Lo staff ha deciso di non procedere con la segnalazione.`)
                    .addFields(
                        { name: 'Staffer', value: `${interaction.user}`, inline: false }
                    )
                    .setTimestamp();
                await reporter.send({ embeds: [dmToReporter] }).catch(() => {});

                await interaction.reply({ content: '❌ Report rifiutato.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.TOKEN);
