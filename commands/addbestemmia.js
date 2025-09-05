const { SlashCommandBuilder } = require("discord.js");
const { loadBlacklist, saveBlacklist } = require("../utils/antibestemmie");

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
    const word = interaction.options.getString("parola").toLowerCase();
    const blacklist = loadBlacklist();

    if (blacklist.includes(word)) {
      return interaction.reply({
        content: "❌ Questa parola **${word}** è già nella blacklist.",
        ephemeral: true
      });
    }

    blacklist.push(word);
    saveBlacklist(blacklist);

    return interaction.reply({
      content: `✅ La parola **${word}** è stata aggiunta alla blacklist.`,
      ephemeral: true
    });
  }
};
