const { SlashCommandBuilder } = require("discord.js");
const { loadBlacklist, saveBlacklist, normalize, blacklistPath } = require("../utils/antibestemmie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbestemmia")
    .setDescription("Aggiunge una parola alla blacklist")
    .addStringOption(option =>
      option.setName("parola")
        .setDescription("La parola da aggiungere")
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString("parola");
    const normalizedWord = normalize(word);
    let blacklist = loadBlacklist();

    console.log("[ADD BESTEMMIA] Comando ricevuto:", word);
    console.log("[ADD BESTEMMIA] Normalizzata:", normalizedWord);
    console.log("[ADD BESTEMMIA] Percorso blacklist:", blacklistPath);

    if (blacklist.includes(normalizedWord)) {
      return interaction.reply({
        content: `❌ La parola **${word}** è già nella blacklist.`,
        ephemeral: true
      });
    }

    blacklist.push(normalizedWord);
    saveBlacklist(blacklist);

    return interaction.reply({
      content: `✅ La parola **${word}** è stata aggiunta alla blacklist.`,
      ephemeral: true
    });
  }
};
