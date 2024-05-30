# projet-DEV

## Description
"morpion" est un projet de jeu de Morpion en ligne utilisant Node.js, Express, et Socket.io. Les joueurs peuvent s'inscrire avec un pseudo, être mis en attente pour une partie, et jouer contre d'autres joueurs en temps réel. Le projet utilise également une base de données MySQL pour stocker les pseudos des joueurs.

## Fonctionnalités
- Inscription des joueurs avec pseudo.
- Mise en attente et appariement des joueurs.
- Gestion des états de jeu pour le Morpion.
- Sauvegarde des pseudos des joueurs dans une base de données MySQL.

## Prérequis
- Node.js et npm
- MySQL

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/tiens-le-code.git
   cd projet-DEV

2. installer les dependances :
     ```bash
    npm install
    npm install express body-parser socket.io 
    npm install express body-parser socket.io mysql

3. configurer la base de données MYSQL :
     ```bash
    CREATE DATABASE morpion;
    CREATE TABLE utilisateurs (
    id VARCHAR(255) PRIMARY KEY,
    pseudo VARCHAR(255) NOT NULL
    );

3. configurer la base de données MYSQL :

    Modifiez les informations de connexion à la base de données dans le fichier app.js
     ```bash
    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'morpion'
});

## utilisation

1. Démarrez le serveur :
    ```bash
    node index.js

    Ouvrez votre navigateur et accédez à http://localhost:3000 pour commencer à jouer.







