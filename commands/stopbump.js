const { SlashCommandBuilder } = require('discord.js');
const { stopBump } = require('../bump');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stopbump')
        .setDescription('Ferma il bump automatico.'),
    async execute(interaction) {
        stopBump();
        await interaction.reply({ content: '🛑 Bump automatico fermato!', ephemeral: true });
    },
};
