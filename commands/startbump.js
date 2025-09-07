const { SlashCommandBuilder } = require('discord.js');
const { startBump } = require('../bump');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startbump')
        .setDescription('Avvia il bump automatico ogni 2 ore.'),
    async execute(interaction) {
        const CHANNEL_ID = 'ID_DEL_TUO_CANALE'; // sostituisci con il canale
        startBump(interaction.client, CHANNEL_ID);
        await interaction.reply({ content: '✅ Bump automatico avviato!', ephemeral: true });
    },
};
