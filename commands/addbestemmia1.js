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
        console.log("➡️ Comando richiamato da:", interaction.user.tag);

        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "❌ Solo l'owner può usare questo comando.", ephemeral: true });
        }

        const parola = interaction.options.getString("parola").toLowerCase();
        const filePath = path.resolve(__dirname, "..", "bestemmie.json");

        console.log("📂 Percorso JSON:", filePath);

        let lista = [];
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, "utf8");
                console.log("📖 Contenuto iniziale:", raw);
                lista = raw ? JSON.parse(raw) : [];
            } catch (err) {
                console.error("❌ Errore leggendo bestemmie.json:", err);
                lista = [];
            }
        }

        if (lista.includes(parola)) {
            return interaction.reply({ content: "⚠️ Questa bestemmia è già presente.", ephemeral: true });
        }

        lista.push(parola);

        try {
            fs.writeFileSync(filePath, JSON.stringify(lista, null, 2), "utf8");
            console.log("✅ Nuovo contenuto scritto:", lista);
        } catch (err) {
            console.error("❌ Errore scrivendo bestemmie.json:", err);
            return interaction.reply({ content: "❌ Errore nel salvataggio.", ephemeral: true });
        }

        return interaction.reply({ content: `✅ Bestemmia **${parola}** aggiunta.`, ephemeral: false });
    }
};
