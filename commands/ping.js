const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Mostra la latenza del bot'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const pingEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🏓 Ping del Bot')
            .addFields(
                { name: '⏱️ Latenza messaggio', value: `${latency}ms`, inline: true },
                { name: '🌐 Latenza API', value: `${apiLatency}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [pingEmbed] });
    }
};
