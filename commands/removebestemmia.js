const { SlashCommandBuilder } = require('discord.js');
const { loadBlacklist, saveBlacklist, normalize } = require('../utils/antibestemmie');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebestemmia')
        .setDescription('Rimuovi una bestemmia dalla blacklist')
        .addStringOption(option =>
            option
                .setName('parola')
                .setDescription('La bestemmia da rimuovere')
                .setRequired(true)
        ),

    async execute(interaction) {
        const parola = normalize(interaction.options.getString('parola'));
        let blacklist = loadBlacklist();

        if (!blacklist.includes(parola)) {
            return interaction.reply({ content: `❌ La parola \`${parola}\` non è nella blacklist.`, ephemeral: true });
        }

        blacklist = blacklist.filter(w => w !== parola);
        saveBlacklist(blacklist);

        return interaction.reply({ content: `✅ La parola \`${parola}\` è stata rimossa dalla blacklist.` });
    }
};
