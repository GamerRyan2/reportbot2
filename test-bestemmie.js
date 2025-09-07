const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "bestemmie.json");

let lista = [];
if (fs.existsSync(filePath)) {
  lista = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
}

lista.push("test-parola");

fs.writeFileSync(filePath, JSON.stringify(lista, null, 2), "utf8");

console.log("✅ File aggiornato:", lista);
