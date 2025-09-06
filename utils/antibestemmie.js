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

// Normalizza stringa (numeri → lettere, simboli → lettere, tutto minuscolo)
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
    .replace(/[^a-z\s]/g, ""); // rimuove simboli vari ma lascia spazi
}

// Controlla messaggi con filtro avanzato
function containsBadWord(text) {
  const blacklist = loadBlacklist();
  const normalizedText = normalize(text);

  // Creiamo regex dinamiche per ogni parola della blacklist
  return blacklist.some(word => {
    const normalizedWord = normalize(word);

    // pattern per trovare la parola anche attaccata a simboli o separata da punti
    const pattern = new RegExp(`\\b${normalizedWord}\\b`, 'i');

    return pattern.test(normalizedText);
  });
}

// Middleware filtro
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
