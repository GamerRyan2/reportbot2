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
        // Controllo owner
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "❌ Solo l'owner può usare questo comando.", ephemeral: true });
        }

        const parola = interaction.options.getString("parola");

        if (!parola) {
            return interaction.reply({ content: "❌ Devi specificare una parola da aggiungere.", ephemeral: true });
        }

        // Path al file
        const filePath = path.join(__dirname, "..", "bestemmie.json");

        // Legge il file
        let lista = [];
        if (fs.existsSync(filePath)) {
            lista = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        // Controlla se esiste già
        if (lista.includes(parola.toLowerCase())) {
            return interaction.reply({ content: "⚠️ Questa bestemmia è già presente nella lista.", ephemeral: true });
        }

        // Aggiunge e salva
        lista.push(parola.toLowerCase());
        fs.writeFileSync(filePath, JSON.stringify(lista, null, 2));

        return interaction.reply({ content: `✅ Bestemmia **${parola}** aggiunta alla lista.`, ephemeral: false });
    }
};
