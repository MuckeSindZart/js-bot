const {Markup} = require('telegraf');
const {getGames, addGame, deleteGame} = require('./games');

function initializeAdminBot(bot, ADMIN_CHAT_ID) {
    // Проверка, является ли пользователь админом
    const isAdmin = (ctx) => ctx.chat.id.toString() === ADMIN_CHAT_ID;

    bot.command('help', (ctx) => {
        return ctx.reply(
            '/addgame - Добавление новой игры \n' +
            '/deletegame - Удаление игры\n' +
            '/games - Просмотр всех игр')
    });

    // Добавление новой игры
    bot.command('addgame', (ctx) => {
        if (!isAdmin(ctx)) {
            return ctx.reply('Вы не можете использовать эту команду.');
        }

        const args = ctx.message.text.split('|').map((arg) => arg.trim());
        if (args.length < 5) {
            return ctx.reply('Используйте формат: /addgame id|Дата|Адрес|Описание|URL_Картинки');
        }

        const [id, date, address, description, image] = args;
        const newGame = {id, date, address, description, image};
        addGame(newGame);

        ctx.reply('Игра успешно добавлена!');
    });

    // Удаление игры
    bot.command('deletegame', (ctx) => {
        if (!isAdmin(ctx)) {
            return ctx.reply('Вы не можете использовать эту команду.');
        }

        const args = ctx.message.text.split(' ').slice(1);
        if (args.length === 0) {
            return ctx.reply('Используйте формат: /deletegame id');
        }

        const gameId = args[0];
        const success = deleteGame(gameId);
        ctx.reply(success ? 'Игра успешно удалена!' : 'Игра не найдена.');
    });

    // Просмотр всех игр
    bot.command('games', (ctx) => {
        if (!isAdmin(ctx)) {
            return ctx.reply('Вы не можете использовать эту команду.');
        }

        const games = getGames();
        if (games.length === 0) {
            return ctx.reply('На данный момент игр нет.');
        }

        ctx.reply(`Список игр:\n${games.map((g) => `ID: ${g.id}, Дата: ${g.date}`).join('\n')}`);
    });
}

module.exports = {initializeAdminBot};
