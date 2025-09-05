const fs = require("fs");
const path = require("path");

// Percorso del file blacklist
const blacklistPath = path.join(__dirname, "../data/blacklist.json");

// Carica blacklist
function loadBlacklist() {
  if (!fs.existsSync(blacklistPath)) {
    fs.writeFileSync(blacklistPath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(blacklistPath));
}

// Salva blacklist
function saveBlacklist(list) {
  fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2));
}

// Normalizza stringa (numeri → lettere, font strani → normali, tutto minuscolo)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .replace(/[0-4]/g, "o") // 0,1,2,3,4 simili a o
    .replace(/5/g, "s")
    .replace(/6/g, "g")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/9/g, "g")
    .replace(/1/g, "i")
    .replace(/[@]/g, "a")
    .replace(/[^a-z]/g, ""); // rimuove simboli vari
}

// Controlla messaggi
function containsBadWord(text) {
  const blacklist = loadBlacklist();
  const normalizedText = normalize(text);

  return blacklist.some(word => normalizedText.includes(normalize(word)));
}

// Middleware filtro
async function checkMessage(message) {
  if (message.author.bot) return;

  if (containsBadWord(message.content)) {
    try {
      await message.delete();
      await message.channel.send(`${message.author}, il tuo messaggio è stato eliminato perché conteneva bestemmie.`);
    } catch (err) {
      console.error("Errore eliminando messaggio:", err);
    }
  }
}

module.exports = { checkMessage, loadBlacklist, saveBlacklist };
