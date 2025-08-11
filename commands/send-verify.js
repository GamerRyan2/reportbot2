const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-verify')
        .setDescription('Invia il messaggio di verifica con captcha'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(config.verifyEmbedTitle || "📋 VERIFY")
            .setDescription(config.verifyEmbedDescription || "Premi il pulsante per verificarti")
            .setColor(config.verifyEmbedColor || "#2b2d31");

        const button = new ButtonBuilder()
            .setCustomId('captcha_verify_start')
            .setLabel('✅ Verificati')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
