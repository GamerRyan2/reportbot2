const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-status')
        .setDescription('🛠 Imposta manualmente lo stato del bot (staff only)')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Testo dello stato')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Tipo di attività')
                .setRequired(true)
                .addChoices(
                    { name: 'Giocando', value: 'PLAYING' },
                    { name: 'Guardando', value: 'WATCHING' },
                    { name: 'Ascoltando', value: 'LISTENING' },
                    { name: 'Competendo', value: 'COMPETING' }
                ))
        .addStringOption(option =>
            option.setName('presence')
                .setDescription('Presenza')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Inattivo', value: 'idle' },
                    { name: 'Non disturbare', value: 'dnd' }
                )),
    async execute(interaction) {
        // Controllo ruolo staff
        if (!interaction.member.roles.cache.has(config.staffRoleId)) {
            return interaction.reply({ content: '❌ Solo lo staff può usare questo comando.', ephemeral: true });
        }

        const text = interaction.options.getString('text');
        const type = interaction.options.getString('type');
        const presence = interaction.options.getString('presence');

        interaction.client.user.setPresence({
            activities: [{ name: text, type: type }],
            status: presence
        });

        await interaction.reply({ content: `✅ Stato aggiornato: **${text}** (${type})`, ephemeral: true });
    }
};
