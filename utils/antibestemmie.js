const fs = require("fs");
const path = require("path");

// Percorso del file blacklist dentro la cartella utils
const blacklistPath = path.join(__dirname, "blacklist.json");

// Crea file vuoto se non esiste
if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2), "utf-8");
    console.log("[ANTIBESTEMMIE] File blacklist.json creato in utils!");
}

// Carica la blacklist
function loadBlacklist() {
    try {
        const data = fs.readFileSync(blacklistPath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("[ANTIBESTEMMIE] Errore leggendo blacklist.json:", err);
        return [];
    }
}

// Salva la blacklist
function saveBlacklist(list) {
    try {
        fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), "utf-8");
        console.log("[ANTIBESTEMMIE] Blacklist salvata!");
    } catch (err) {
        console.error("[ANTIBESTEMMIE] Errore salvando blacklist:", err);
    }
}

// Normalizza testo (numeri, simboli e accenti)
function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[0]/g, "o")
        .replace(/[1]/g, "i")
        .replace(/[2]/g, "z")
        .replace(/[3]/g, "e")
        .replace(/[4]/g, "a")
        .replace(/[5]/g, "s")
        .replace(/[6]/g, "g")
        .replace(/[7]/g, "t")
        .replace(/[8]/g, "b")
        .replace(/[9]/g, "g")
        .replace(/[@!]/g, "a")
        .replace(/[^a-z\s]/g, "");
}

// Controlla se un testo contiene bestemmie
function containsBadWord(text) {
    const blacklist = loadBlacklist();
    const normalizedText = normalize(text);
    return blacklist.some(word => {
        const pattern = new RegExp(`\\b${word}\\b`, "i"); // solo parole intere
        return pattern.test(normalizedText);
    });
}

// Middleware filtro messaggi
async function checkMessage(message) {
    if (message.author.bot) return;

    if (containsBadWord(message.content)) {
        try {
            await message.delete();
            await message.channel.send(`${message.author}, il tuo messaggio è stato eliminato perché conteneva bestemmie.`);
        } catch (err) {
            console.error("[ANTIBESTEMMIE] Errore eliminando messaggio:", err);
        }
    }
}

module.exports = {
    checkMessage,
    loadBlacklist,
    saveBlacklist,
    normalize,
    blacklistPath
};
