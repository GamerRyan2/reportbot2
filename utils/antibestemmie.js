const fs = require("fs");
const path = require("path");

// Percorso cartella data e blacklist
const dataDir = path.join(__dirname, "../data");
const blacklistPath = path.join(dataDir, "blacklist.json");

// Assicuriamoci che la cartella data esista
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Carica blacklist dal file (crea il file se non esiste)
function loadBlacklist() {
  if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2), "utf-8");
  }
  const content = fs.readFileSync(blacklistPath, "utf-8");
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("Errore leggendo blacklist.json:", err);
    return [];
  }
}

// Salva blacklist su file
function saveBlacklist(list) {
  fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), "utf-8");
}

// Normalizza stringa (numeri → lettere, simboli → lettere, minuscolo)
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
    .replace(/[^a-z\s]/g, ""); // rimuove simboli vari ma lascia spazi
}

// Controlla se il testo contiene bestemmie
function containsBadWord(text) {
  const blacklist = loadBlacklist(); // già normalizzate
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

module.exports = { checkMessage, loadBlacklist, saveBlacklist, normalize };
