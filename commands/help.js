const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('📜 Mostra la lista dei comandi disponibili'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('📜 Lista Comandi')
            .setColor('#2b2d31')
            .setDescription('Ecco tutti i comandi disponibili del bot:')
            .addFields(
                { name: '/help', value: 'Mostra questo messaggio di aiuto', inline: true },
                { name: '/ping', value: 'Mostra la latenza del bot', inline: true },
                { name: '/report', value: 'Segnala un utente allo staff', inline: true },
                { name: '/send-verify', value: 'Invia il messaggio di verifica captcha (Owner only)', inline: true },
                { name: '/set-status', value: 'Modifica lo stato del bot (Staff only)', inline: true },
                { name: '/stats', value: 'Mostra le statistiche del bot', inline: true },
                { name: '/uptime', value: 'Mostra da quanto tempo il bot è online', inline: true },
                { name: '/vote', value: 'Mostra il link per votare il bot', inline: true },
                { name: '🆕 /send-verifica', value: 'Invia la verifica captcha (Owner only)', inline: true },
                { name: '🆕 /status', value: 'Comando status personalizzato (Staff only)', inline: true }
            )
            .setFooter({ text: 'Bot MultiFunzione', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
};
