const { SlashCommandBuilder } = require('discord.js');
const { loadBlacklist, saveBlacklist, normalize } = require('../utils/antibestemmie');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbestemmie')
        .setDescription('Aggiungi più bestemmie alla blacklist')
        .addStringOption(option =>
            option
                .setName('parole')
                .setDescription('Inserisci più bestemmie separate da virgola (es: parola1, parola2, parola3)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const rawInput = interaction.options.getString('parole');
        const parole = rawInput
            .split(',')
            .map(p => normalize(p.trim()))
            .filter(p => p.length > 0);

        if (parole.length === 0) {
            return interaction.reply({ content: '❌ Non hai inserito parole valide.', ephemeral: true });
        }

        let blacklist = loadBlacklist();
        let aggiunte = [];
        let giàPresenti = [];

        for (const parola of parole) {
            if (blacklist.includes(parola)) {
                giàPresenti.push(parola);
            } else {
                blacklist.push(parola);
                aggiunte.push(parola);
            }
        }

        saveBlacklist(blacklist);

        let risposta = '';
        if (aggiunte.length > 0) risposta += `✅ Aggiunte: \`${aggiunte.join('`, `')}\`\n`;
        if (giàPresenti.length > 0) risposta += `⚠️ Già presenti: \`${giàPresenti.join('`, `')}\``;

        return interaction.reply({ content: risposta || 'Nessuna parola aggiunta.', ephemeral: false });
    }
};
