require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Prende i dati dal file .env
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error("❌ Errore: TOKEN, CLIENT_ID o GUILD_ID mancanti nel file .env");
    process.exit(1);
}

// Legge tutti i comandi dalla cartella /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`⚠️ Il comando in ${file} è incompleto: manca "data" o "execute".`);
    }
}

// Inizializza REST
const rest = new REST({ version: '10' }).setToken(token);

// Registra i comandi nella GUILD
(async () => {
    try {
        console.log(`🔄 Ricaricamento di ${commands.length} comandi slash...`);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('✅ Comandi ricaricati con successo!');
    } catch (error) {
        console.error(error);
    }
})();
