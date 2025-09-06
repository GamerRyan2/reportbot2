const fs = require("fs");
const path = require("path");

// Percorso cartella data e file blacklist
const dataDir = path.resolve(__dirname, "../data");
const blacklistPath = path.join(dataDir, "blacklist.json");

// Crea la cartella data se non esiste
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Carica la blacklist o crea il file se non esiste
function loadBlacklist() {
  if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    return JSON.parse(fs.readFileSync(blacklistPath, "utf-8"));
  } catch (err) {
    console.error("Errore leggendo blacklist.json:", err);
    return [];
  }
}

// Salva la blacklist nel file
function saveBlacklist(list) {
  fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), "utf-8");
}

// Normalizza stringa (numeri, simboli e accenti)
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
    .replace(/[^a-z\s]/g, ""); // rimuove simboli ma lascia spazi
}

// Controlla se il testo contiene bestemmie
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
      await message.channel.send(
        `${message.author}, il tuo messaggio è stato eliminato perché conteneva bestemmie.`
      );
    } catch (err) {
      console.error("Errore eliminando messaggio:", err);
    }
  }
}

module.exports = {
  checkMessage,
  loadBlacklist,
  saveBlacklist,
  normalize
}
