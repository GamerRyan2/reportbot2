const fs = require("fs");
const path = require("path");

// Percorso file blacklist
const blacklistPath = path.resolve(__dirname, "blacklist.json");

// Crea file vuoto se non esiste
if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2), "utf8");
    console.log("[ANTIBESTEMMIE] blacklist.json creato in utils!");
}

function loadBlacklist() {
    try {
        const data = fs.readFileSync(blacklistPath, "utf8");
        if (!data) return [];
        return JSON.parse(data);
    } catch (err) {
        console.error("[ANTIBESTEMMIE] Errore leggendo blacklist.json:", err);
        return [];
    }
}

function saveBlacklist(list) {
    try {
        fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), "utf8");
        console.log("[ANTIBESTEMMIE] Blacklist salvata!");
    } catch (err) {
        console.error("[ANTIBESTEMMIE] Errore salvando blacklist:", err);
    }
}

function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // rimuove accenti
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
        .replace(/[^a-z\s]/g, ""); // rimuove simboli
}

function containsBadWord(text) {
    const blacklist = loadBlacklist();
    const normalizedText = normalize(text);

    return blacklist.some(word => {
        // escape regex speciale tipo . ? + * ecc
        const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${safeWord}\\b`, "i").test(normalizedText);
    });
}

// Cooldown anti-flood: 5 secondi
const cooldown = new Map();

async function checkMessage(message) {
    if (message.author.bot) return;

    if (containsBadWord(message.content)) {
        try {
            await message.delete();

            const now = Date.now();
            if (cooldown.has(message.author.id) && now - cooldown.get(message.author.id) < 5000) {
                return; // evita flood
            }
            cooldown.set(message.author.id, now);

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
