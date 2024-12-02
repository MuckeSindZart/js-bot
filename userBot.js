const {Markup} = require('telegraf');
const {getGames} = require('./games'); // Логика для работы с играми
//Информация о играх
function sendGameInfo(ctx, game) {
    ctx.replyWithPhoto("https://cataas.com/cat?type=square", {
        caption: `Игра №${game.id}\nДата: ${game.date}\nАдрес: ${game.address}\nОписание: ${game.description}`,
        parse_mode: 'HTML', ...Markup.inlineKeyboard([
            [Markup.button.callback('Зарегистрироваться', `register_${game.id}`)],
            [Markup.button.callback('Назад', 'back_to_start')]
        ])
    });
}
//Список игр
function sendGameList(ctx, games, title = 'Список игр') {
    if (!games || games.length === 0) {
        return ctx.reply('На данный момент игр нет.');
    }

    // Генерация кнопок для каждой игры
    const buttons = games.map((game) =>
        Markup.button.callback(`Игра №${game.id} (${game.date})`, `details_${game.id}`)
    );

    // Отправка сообщения с кнопками
    ctx.reply(
        title,
        Markup.inlineKeyboard(buttons, {columns: 1}) // Одна кнопка в строке
    );
}

// ЗАПУСК
function initializeUserBot(bot, ADMIN_CHAT_ID) {
    // Стартовое сообщение для пользователей
    bot.start((ctx) => {
        if (ctx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

        ctx.reply(
            'Добро пожаловать! Выберите действие:',
            Markup.inlineKeyboard([
                [Markup.button.callback('Ближайшие игры', 'nearest_games')],
                [Markup.button.callback('Расписание игр на месяц', 'monthly_schedule')]
            ])
        );
    });

    // Обработка кнопки "Ближайшие игры"
    bot.action('nearest_games', (ctx) => {
        const games = getGames().slice(0, 2); // Берём первые две игры
        sendGameList(ctx, games, 'Выберите одну из ближайших игр:');
    });


    // Обработка кнопки "Расписание игр на месяц"
    bot.action('monthly_schedule', (ctx) => {
        const games = getGames(); // Все доступные игры
        sendGameList(ctx, games, 'Вот расписание игр на месяц:');
    });

    // Обработка кнопки "Подробнее" для конкретной игры
    bot.action(/details_\d+/, async (ctx) => {
        const gameId = ctx.match[0].split('_')[1]; // Получаем ID игры
        const game = getGames().find((g) => g.id === gameId);

        if (!game) {
            return ctx.reply('Игра не найдена.');
        }

        // Отправляем фотографию с кнопками
        sendGameInfo(ctx, game)
    });

    // Обработка кнопки "Назад"
    bot.action('back_to_start', (ctx) => {
        ctx.reply(
            'Возврат к главному меню:',
            Markup.inlineKeyboard([
                [Markup.button.callback('Ближайшие игры', 'nearest_games')],
                [Markup.button.callback('Расписание игр на месяц', 'monthly_schedule')]
            ])
        );
    });

    // Обработка кнопки "Зарегистрироваться"
    bot.action(/register_\d+/, (ctx) => {
        const gameId = ctx.match[0].split('_')[1]; // Получаем ID игры
        ctx.reply(
            'Для регистрации оставьте свои данные (одним сообщением):\n1. Ваше имя\n2. Почта\n3. Телефон\n4. Название команды\n5. Количество человек\n6. Промокод (если есть)'
        );

        // Ожидание ввода данных от пользователя
        bot.on('text', async (messageCtx) => {
            if (messageCtx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

            const userData = messageCtx.message.text;

            // Информация о пользователе
            const userInfo =
                `Информация о пользователе:\n` +
                `Имя: ${messageCtx.from.first_name || 'Не указано'}\n` +
                `Фамилия: ${messageCtx.from.last_name || 'Не указана'}\n` +
                `Username: @${messageCtx.from.username || 'Не указан'}\n` +
                `ID: ${messageCtx.from.id}`;

            // Отправка заявки в админский чат
            await bot.telegram.sendMessage(
                ADMIN_CHAT_ID,
                `Новая заявка на игру №${gameId}:\n\nДанные:\n${userData}\n\n${userInfo}`
            );

            // Ответ пользователю
            messageCtx.reply(
                'Спасибо! Мы с вами свяжемся, чтобы подтвердить вашу запись.\n\nПодпишитесь на канал и посмотрите расписание игр:',
                Markup.inlineKeyboard([
                    [Markup.button.url('Подписаться на канал', 'https://t.me/your_channel')],
                    [Markup.button.url('Перейти на портал', 'https://yourportal.com')],
                    [Markup.button.callback('Список игр', 'back_to_start')]
                ])
            );
        });
    });
}

module.exports = {initializeUserBot};
