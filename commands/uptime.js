const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('⏳ Mostra da quanto tempo il bot è online'),
    async execute(interaction) {
        let totalSeconds = (interaction.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#00ffcc')
            .setTitle('⏳ Uptime del bot')
            .setDescription(`Il bot è online da **${uptimeString}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
