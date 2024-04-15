const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Importer le module 'path' pour gérer les chemins de fichiers
const app = express();
const port = 3000;

app.use(bodyParser.json());

let waitingPlayers = [];

app.post('/matchmaking', (req, res) => {
  const playerId = req.body.playerId;
  waitingPlayers.push(playerId);

  if (waitingPlayers.length >= 2) {
    const player1 = waitingPlayers.shift();
    const player2 = waitingPlayers.shift();
    console.log(`Match trouvé : ${player1} vs ${player2}`);
    res.send({ redirect: '/game.html' }); // Redirection vers la page de jeu
  } else {
    res.send('En attente de partie');
  }
});

// Route pour servir la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour servir la page Puissance 4
app.get('/puissance4.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'puissance4.html'));
});

app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
