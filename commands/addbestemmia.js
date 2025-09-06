const { SlashCommandBuilder } = require("discord.js");
const { loadBlacklist, saveBlacklist, normalize } = require("../utils/antibestemmie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbestemmia")
    .setDescription("Aggiunge una nuova parola alla blacklist bestemmie")
    .addStringOption(option =>
      option.setName("parola")
        .setDescription("La parola da aggiungere alla blacklist")
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString("parola");
    const normalizedWord = normalize(word);
    const blacklist = loadBlacklist();

    // Controllo duplicati
    if (blacklist.includes(normalizedWord)) {
      return interaction.reply({
        content: `❌ La parola **${word}** è già nella blacklist.`,
        ephemeral: true
      });
    }

    blacklist.push(normalizedWord); // salvo normalizzata
    saveBlacklist(blacklist); // scrive su file persistente

    return interaction.reply({
      content: `✅ La parola **${word}** è stata aggiunta alla blacklist.`,
      ephemeral: true
    });
  }
};
