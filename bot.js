require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const siteMessages = require('./messages/botMessages');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

// LOGIN del bot (puoi usare lo stesso token del bot principale o un bot secondario)
client.login(process.env.TOKEN);

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    let featuresHTML = siteMessages.features.map(f => `
        <div class="feature">
            <h3>${f.title}</h3>
            <p>${f.detail}</p>
        </div>
    `).join('');

    res.send(`
        <html>
        <head>
            <title>${siteMessages.name}</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            <header>
                <h1>${siteMessages.name}</h1>
            </header>
            <section>
                <h2>Chi è ${siteMessages.name}</h2>
                <p>${siteMessages.description}</p>
            </section>
            <section>
                <h2>Funzionalità</h2>
                ${featuresHTML}
            </section>
            <section>
                <h2>Recensioni e Voti</h2>
                <div id="voteStats">👍 ${siteMessages.votes.positive}  👎 ${siteMessages.votes.negative}</div>
                <div>
                    <button onclick="vote(1)">⭐</button>
                    <button onclick="vote(2)">⭐⭐</button>
                    <button onclick="vote(3)">⭐⭐⭐</button>
                    <button onclick="vote(4)">⭐⭐⭐⭐</button>
                    <button onclick="vote(5)">⭐⭐⭐⭐⭐</button>
                </div>
            </section>
            <section>
                <h2>Scrivi al proprietario</h2>
                <input type="text" id="username" placeholder="Il tuo username Discord">
                <textarea id="message" placeholder="Il tuo messaggio"></textarea>
                <button onclick="sendMessage()">Invia messaggio</button>
            </section>
            <footer>
                © 2025 ${siteMessages.name}
            </footer>
            <script src="script.js"></script>
        </body>
        </html>
    `);
});

// Endpoint voti stelline (simulazione locale)
let positiveVotes = siteMessages.votes.positive;
let negativeVotes = siteMessages.votes.negative;

app.post('/vote/:stars', (req, res) => {
    const stars = parseInt(req.params.stars);
    if (stars >= 4) positiveVotes++;
    else negativeVotes++;
    res.json({ positive: positiveVotes, negative: negativeVotes });
});

// Endpoint invio messaggio DM al proprietario
app.post('/send-message', async (req, res) => {
    const { username, message } = req.body;
    try {
        const owner = await client.users.fetch(siteMessages.ownerId);
        await owner.send(`📩 Messaggio da **${username}**:\n${message}`);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Sito web di ${siteMessages.name} in ascolto sulla porta ${PORT}`));

