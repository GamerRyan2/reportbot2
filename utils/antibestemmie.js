const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const blacklistPath = path.join(dataDir, "blacklist.json");

// Crea la cartella data se non esiste
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("[ANTIBESTEMMIE] Cartella data creata!");
}

// Carica blacklist o crea file vuoto
function loadBlacklist() {
  if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2), "utf-8");
    console.log("[ANTIBESTEMMIE] File blacklist.json creato!");
  }
  try {
    const data = fs.readFileSync(blacklistPath, "utf-8");
    if (!data.trim()) return []; // file vuoto
    return JSON.parse(data);
  } catch (err) {
    console.error("[ANTIBESTEMMIE] Errore leggendo blacklist.json:", err);
    return [];
  }
}

// Salva blacklist
function saveBlacklist(list) {
  try {
    if (!Array.isArray(list)) list = [];
    fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), "utf-8");
    console.log("[ANTIBESTEMMIE] Blacklist salvata:", list);
  } catch (err) {
    console.error("[ANTIBESTEMMIE] Errore salvando blacklist:", err);
  }
}

// Normalizza stringa (numeri, simboli, accenti)
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

// Controlla se il messaggio contiene bestemmie
function containsBadWord(text) {
  const blacklist = loadBlacklist();
  const normalizedText = normalize(text);
  return blacklist.some(word => normalizedText.includes(word));
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
