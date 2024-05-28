const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(bodyParser.json());

let waitingPlayers = [];

// Structure pour stocker l'état du jeu pour chaque salle
const gameStates = {};

// Fonction pour vérifier si un joueur a gagné
function checkWin(board, row, col, player) {
    // Logique de vérification de victoire...
}

// Fonction pour mettre à jour l'état du jeu et vérifier si quelqu'un a gagné
function updateGameState(room, move, player) {
    const gameState = gameStates[room];
    const column = move;
    const row = gameState.heights[column];

    // Vérifier si la colonne est pleine
    if (row >= 6) {
        return;
    }

    // Mettre à jour le plateau de jeu avec le mouvement du joueur
    gameState.board[row][column] = player;
    gameState.heights[column]++;

    // Vérifier s'il y a un gagnant
    gameState.winner = checkWin(gameState.board, row, column, player);

    // Passer au prochain joueur
    gameState.currentPlayer = gameState.currentPlayer === gameState.player1 ? gameState.player2 : gameState.player1;
}

// Route pour servir la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour servir la page d'attente
app.get('/wait.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'wait.html'));
});

// Route pour servir la page Puissance 4
app.get('/puissance4.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'puissance4.html'));
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('Nouveau client connecté', socket.id);

    // Ajouter le joueur à la file d'attente
    waitingPlayers.push({ id: socket.id });
    console.log(`Joueurs en attente: ${waitingPlayers.map(player => player.id)}`);

    // Vérifier si nous avons au moins deux joueurs en attente
    if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift().id;
        const player2 = waitingPlayers.shift().id;
        const room = `game_${player1}_${player2}`;
        console.log(`Match trouvé : ${player1} vs ${player2} dans la salle ${room}`);

        // Informer les deux joueurs du match et les rediriger vers la page de jeu
        io.to(player1).emit('match_found', { opponent: player2, room: room, redirect: '/puissance4.html' });
        io.to(player2).emit('match_found', { opponent: player1, room: room, redirect: '/puissance4.html' });

        // Faire rejoindre la salle aux deux joueurs
        io.sockets.sockets.get(player1).join(room);
        io.sockets.sockets.get(player2).join(room);

        // Initialiser l'état du jeu pour cette salle
        gameStates[room] = {
            board: Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => null)),
            heights: Array(7).fill(0),
            winner: null,
            player1: player1,
            player2: player2,
            currentPlayer: player1 // Joueur 1 commence
        };

        // Démarrer le jeu
        io.to(room).emit('start_game', room);
    }

    socket.on('make_move', (data) => {
      
        const room = data.room;
        const move = data.move;
        const player = socket.id;
        const gameState = gameStates[room];
        console.log(`move`);//llllllllllleeeeeeeeeeeProblemmeeeeeeeeeeeeestlaaaaaaaaaaaaa
        
        updateGameState(room, move, player);
        io.to(room).emit('game_state', gameState);
        
    });

    socket.on('disconnect', () => {
        console.log('Client déconnecté', socket.id);
        waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
    });
});

server.listen(port, () => {
    console.log(`Serveur écoutant sur le port ${port}`);
});
