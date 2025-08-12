const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('📩 Segnala un utente allo staff')
        .addUserOption(option =>
            option.setName('utente')
                .setDescription('Utente da segnalare')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo della segnalazione')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('utente');
        const reason = interaction.options.getString('motivo');
        const reporter = interaction.user;

        const reportEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('📢 Nuova Segnalazione')
            .setDescription('È stata inviata una nuova segnalazione allo staff.')
            .addFields(
                { name: '👤 Utente segnalato', value: `${target}`, inline: false },
                { name: '📝 Motivo', value: reason, inline: false },
                { name: '📨 Segnalato da', value: `${reporter}`, inline: false }
            )
            .setTimestamp();

        // Codifica il motivo per poterlo passare al modal in index.js
        const encodedReason = encodeURIComponent(reason);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accetta_${reporter.id}_${target.id}_${encodedReason}`)
                .setLabel('✅ Prendi in considerazione')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`rifiuta_${reporter.id}_${target.id}_${encodedReason}`)
                .setLabel('❌ Rifiuta')
                .setStyle(ButtonStyle.Danger)
        );

        const staffChannel = interaction.guild.channels.cache.get(config.reportChannelId);
        if (!staffChannel) {
            return interaction.reply({ content: '⚠️ Canale report non trovato.', ephemeral: true });
        }

        await staffChannel.send({
            content: `<@&${config.staffRoleId}> 📢 Nuovo report ricevuto!`,
            embeds: [reportEmbed],
            components: [row]
        });

        await interaction.reply({ content: '✅ Report inviato con successo allo staff!', ephemeral: true });
    }
};
