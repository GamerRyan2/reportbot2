require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ===== CONFIG =====
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error("❌ Errore: TOKEN, CLIENT_ID o GUILD_ID mancanti nel file .env");
    process.exit(1);
}

// ===== LETTURA COMANDI =====
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
    console.error(`❌ La cartella "commands" non esiste in ${commandsPath}`);
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

if (commandFiles.length === 0) {
    console.warn("⚠️ Nessun comando trovato nella cartella /commands");
}

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Comando caricato: ${command.data.name}`);
    } else {
        console.warn(`⚠️ Comando ignorato (manca data o execute): ${file}`);
    }
}

// ===== REGISTRAZIONE =====
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`\n🔄 Ricaricamento di ${commands.length} comandi slash nella gilda ${guildId}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`\n✅ Operazione completata: ${data.length} comandi attivi ora nella gilda.`);
    } catch (error) {
        console.error("❌ Errore durante il deploy dei comandi:", error);
    }
})();
