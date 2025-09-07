const fs = require("fs");
const path = require("path");
const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignora i bot
        if (message.author.bot) return;

        // Legge lista bestemmie
        const filePath = path.resolve(__dirname, "..", "bestemmie.json");
        if (!fs.existsSync(filePath)) return;

        const lista = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Controlla se il messaggio contiene una bestemmia
        const testo = message.content.toLowerCase();
        if (lista.some(word => testo.includes(word))) {
            try {
                await message.delete();
                console.log(`❌ Messaggio cancellato di ${message.author.tag}: ${message.content}`);
            } catch (err) {
                console.error("Errore nella cancellazione:", err);
            }
        }
    }
};
