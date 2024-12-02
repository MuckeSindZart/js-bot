const fs = require('fs');
const path = require('path');
const GAMES_FILE = path.join(__dirname, 'games.json');

const getGames = () => {
    try {
        return JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8'));
    } catch {
        return [];
    }
};

const addGame = (game) => {
    const games = getGames();
    games.push(game);
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
};

const deleteGame = (id) => {
    let games = getGames();
    const initialLength = games.length;
    games = games.filter((game) => game.id !== id);
    fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
    return games.length < initialLength;
};

module.exports = { getGames, addGame, deleteGame };
