require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ===== Variabili da .env =====
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.error("❌ Errore: TOKEN, CLIENT_ID o GUILD_ID mancanti nel file .env");
    process.exit(1);
}

// ===== Lettura comandi dalla cartella /commands =====
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
    console.error(`❌ Cartella "commands" non trovata: ${commandsPath}`);
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Caricato comando: ${command.data.name}`);
    } else {
        console.warn(`⚠️ Ignorato file: ${file} (manca "data" o "execute")`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`\n🔄 Pulizia comandi GLOBALI...`);
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log(`✅ Comandi globali rimossi.`);

        console.log(`\n🔄 Pulizia comandi GILDA (${guildId})...`);
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log(`✅ Comandi gilda rimossi.`);

        console.log(`\n🚀 Caricamento nuovi comandi nella gilda...`);
        const dataGuild = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`✅ ${dataGuild.length} comandi registrati nella gilda.`);
        console.log(`\n✨ Deploy completato!`);
    } catch (error) {
        console.error("❌ Errore durante il deploy:", error);
    }
})();
