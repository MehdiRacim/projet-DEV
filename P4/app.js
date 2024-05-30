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

const gameStates = {};

function checkWin(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];

    return winPatterns.some(pattern => 
        pattern.every(index => 
            board[Math.floor(index / 3)][index % 3] === player
        )
    );
}

function updateGameState(room, cell, player) {
    const gameState = gameStates[room];
    const row = Math.floor(cell / 3);
    const col = cell % 3;

    if (gameState.board[row][col] || gameState.winner) {
        return;
    }

    gameState.board[row][col] = player;
    if (checkWin(gameState.board, player)) {
        gameState.winner = player;
    } else {
        gameState.currentPlayer = gameState.currentPlayer === gameState.player1 ? gameState.player2 : gameState.player1;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/wait.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'wait.html'));
});

app.get('/puissance4.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'morpion.html'));
});

const mysql = require('mysql');

// Connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'morpion'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

const playerPseudos = {};
io.on('connection', (socket) => {
    console.log('Nouveau client connecté', socket.id);

    socket.on('pseudo_submit', (pseudo) => {
        playerPseudos[socket.id] = pseudo;
        console.log(`Pseudo enregistré pour ${socket.id}: ${pseudo}`);
    });

    waitingPlayers.push({ id: socket.id });
    console.log(`Joueurs en attente: ${waitingPlayers.map(player => player.id)}`);

    if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift().id;
        const player2 = waitingPlayers.shift().id;
        const room = `game_${player1}_${player2}`;
        console.log(`Match trouvé : ${player1} vs ${player2} dans la salle ${room}`);

        io.to(player1).emit('match_found', { opponent: player2, room: room, redirect: '/puissance4.html' });
        io.to(player2).emit('match_found', { opponent: player1, room: room, redirect: '/puissance4.html' });

        io.sockets.sockets.get(player1).join(room);
        io.sockets.sockets.get(player2).join(room);

        gameStates[room] = {
            board: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null)),
            winner: null,
            player1: player1,
            player2: player2,
            currentPlayer: player1
        };

        io.to(room).emit('start_game', room);
    }

    socket.on('disconnect', () => {
        console.log('Client déconnecté', socket.id);
        waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
        delete playerPseudos[socket.id]; // Supprime le pseudo associé à l'ID déconnecté
    });

    socket.on('pseudo_submit', (pseudo) => {
        const userId = socket.id;
        const sql = 'INSERT INTO utilisateurs (id, pseudo) VALUES (?, ?)';
        connection.query(sql, [userId, pseudo], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion du pseudo dans la base de données :', err);
                return;
            }
            console.log('Pseudo inséré avec succès dans la base de données');
        });
    });
    socket.on('make_move', (data) => {
        const room = data.room;
        const cell = data.cell;
        const player = socket.id;

        if (!room || !gameStates[room]) {
            console.log(`Erreur : état du jeu introuvable pour la salle ${room}`);
            return;
        }

        console.log(`Move reçu de ${player} pour la salle ${room}, cellule ${cell}`);
        console.log(`État du jeu avant mise à jour pour la salle ${room}:`, gameStates[room]);

        updateGameState(room, cell, player);
        io.to(room).emit('game_state', gameStates[room]);

        console.log(`État du jeu après mise à jour pour la salle ${room}:`, gameStates[room]);
    });

    socket.on('disconnect', () => {
        console.log('Client déconnecté', socket.id);
        waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
    });
});

server.listen(port, () => {
    console.log(`Serveur écoutant sur le port ${port}`);
});
