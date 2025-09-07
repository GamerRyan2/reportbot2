const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

// Config
const LOG_CHANNEL_ID = "1377345674320023703";
const EXTRA_ROLES = ["1372556846178766968", "1372553018486296617"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("depex")
    .setDescription("Rimuove il ruolo assegnato e lascia il ruolo di base")
    .addUserOption(opt => opt.setName("utente").setDescription("Utente da modificare").setRequired(true))
    .addRoleOption(opt => opt.setName("ruoloprima").setDescription("Ruolo di base").setRequired(true))
    .addRoleOption(opt => opt.setName("ruolodopo").setDescription("Ruolo da rimuovere").setRequired(true))
    .addStringOption(opt => opt.setName("motivo").setDescription("Motivo del cambio").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.options.getMember("utente");
    const ruoloPrima = interaction.options.getRole("ruoloprima");
    const ruoloDopo = interaction.options.getRole("ruolodopo");
    const motivo = interaction.options.getString("motivo");
    const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

    try {
      await member.roles.remove(ruoloDopo);
      for (const extra of EXTRA_ROLES) {
        await member.roles.remove(extra);
      }

      const embed = new EmbedBuilder()
        .setTitle("📤 DEPEX")
        .setColor("Red")
        .addFields(
          { name: "👤 Utente", value: `${member.user.tag}`, inline: false },
          { name: "📌 Da", value: ruoloPrima.toString(), inline: true },
          { name: "❌ A", value: ruoloDopo.toString(), inline: true },
          { name: "📝 Motivo", value: motivo, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ content: `✅ Ruolo rimosso da ${member.user.tag}`, ephemeral: true });
      if (logChannel) await logChannel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Errore durante la rimozione dei ruoli.", ephemeral: true });
    }
  },
};
