// Gestione invio messaggio DM all'owner
async function sendMessage() {
    const username = document.getElementById("username").value;
    const message = document.getElementById("message").value;

    if (!username || !message) {
        alert("Compila tutti i campi!");
        return;
    }

    const response = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message })
    });

    const data = await response.json();
    if (data.success) {
        alert("Messaggio inviato con successo!");
        document.getElementById("username").value = "";
        document.getElementById("message").value = "";
    } else {
        alert("Errore nell'invio del messaggio.");
    }
}

// Gestione voti stelline
function vote(star) {
    fetch(`/vote/${star}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            document.getElementById("voteStats").innerText = `👍 ${data.positive}  👎 ${data.negative}`;
        });
}
