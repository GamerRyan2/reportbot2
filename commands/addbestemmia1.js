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
        console.log("➡️ Comando /addbestemmia1 ricevuto da:", interaction.user.tag, "(", interaction.user.id, ")");

        // --- check owner ---
        if (interaction.user.id !== config.ownerId) {
            console.log("❌ Utente non autorizzato. Owner richiesto:", config.ownerId);
            return interaction.reply({ content: "❌ Solo l'owner può usare questo comando.", ephemeral: true });
        }
        console.log("✅ Owner verificato");

        // --- get parola ---
        const parola = interaction.options.getString("parola").toLowerCase();
        console.log("📥 Parola ricevuta:", parola);

        // --- percorso file ---
        const filePath = path.resolve(__dirname, "..", "bestemmie.json");
        console.log("📂 Percorso file bestemmie:", filePath);

        // --- leggi lista ---
        let lista = [];
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, "utf8");
                console.log("📖 Contenuto JSON iniziale:", raw);
                lista = raw ? JSON.parse(raw) : [];
            } catch (err) {
                console.error("❌ Errore leggendo bestemmie.json:", err);
                lista = [];
            }
        } else {
            console.log("⚠️ File bestemmie.json non trovato, ne creo uno nuovo");
        }

        // --- check duplicato ---
        if (lista.includes(parola)) {
            console.log("⚠️ Parola già presente:", parola);
            return interaction.reply({ content: "⚠️ Questa bestemmia è già presente.", ephemeral: true });
        }

        // --- aggiungi e salva ---
        lista.push(parola);
        console.log("📝 Lista aggiornata:", lista);

        try {
            fs.writeFileSync(filePath, JSON.stringify(lista, null, 2), "utf8");
            console.log("✅ File scritto correttamente.");
        } catch (err) {
            console.error("❌ Errore scrivendo bestemmie.json:", err);
            return interaction.reply({ content: "❌ Errore nel salvataggio.", ephemeral: true });
        }

        // --- conferma a Discord ---
        return interaction.reply({ content: `✅ Bestemmia **${parola}** aggiunta e salvata.`, ephemeral: false });
    }
};
