// bump.js
let interval;

async function startBump(client, channelId) {
    const sendBump = async () => {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send('/bump');
            console.log('Bump inviato!');
        }
    };

    // Invio iniziale
    sendBump();

    // Loop ogni 2 ore
    interval = setInterval(sendBump, 2 * 60 * 60 * 1000);
}

function stopBump() {
    if (interval) {
        clearInterval(interval);
        console.log('Bump automatico fermato.');
    }
}

module.exports = { startBump, stopBump };
