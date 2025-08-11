const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Mostra le statistiche del bot'),
    async execute(interaction) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime % 86400 / 3600);
        const minutes = Math.floor(uptime % 3600 / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#00ffcc')
            .setTitle('📊 Statistiche del bot')
            .addFields(
                { name: '⏳ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: '💾 Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: '🖥️ CPU', value: `${os.cpus()[0].model}`, inline: false },
                { name: '💻 Sistema', value: `${os.platform()} ${os.release()}`, inline: true },
                { name: '🤖 Discord.js', value: `v${version}`, inline: true },
                { name: '⚙️ Node.js', value: `${process.version}`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
