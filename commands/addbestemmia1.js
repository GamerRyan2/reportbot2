const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addbestemmia1")
        .setDescription("Aggiunge una bestemmia alla lista bloccata")
        .addStringOption(option =>
            option.setName("parola")
                .setDescription("La bestemmia da aggiungere")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "❌ Solo l'owner può usare questo comando.", ephemeral: true });
        }

        const parola = interaction.options.getString("parola").toLowerCase();
        const filePath = path.resolve(__dirname, "..", "bestemmie.json");

        let lista = [];
        if (fs.existsSync(filePath)) {
            try {
                lista = JSON.parse(fs.readFileSync(filePath, "utf8"));
            } catch (err) {
                console.error("Errore leggendo bestemmie.json:", err);
            }
        }

        if (lista.includes(parola)) {
            return interaction.reply({ content: "⚠️ Questa bestemmia è già presente.", ephemeral: true });
        }

        lista.push(parola);

        try {
            fs.writeFileSync(filePath, JSON.stringify(lista, null, 2));
            console.log(`✅ Bestemmia "${parola}" salvata in ${filePath}`);
        } catch (err) {
            console.error("Errore scrivendo bestemmie.json:", err);
            return interaction.reply({ content: "❌ Errore nel salvataggio.", ephemeral: true });
        }

        return interaction.reply({ content: `✅ Bestemmia **${parola}** aggiunta.`, ephemeral: true });
    }
};
