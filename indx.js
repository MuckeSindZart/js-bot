const {Telegraf, Markup} = require('telegraf')
const {message} = require('telegraf/filters')
const fs = require('fs');

const BOT_TOKEN = "BOT_TOKEN"

const ADMIN_CHAT_ID = 'ADMIN_CHAT_ID';

// const bot = new Telegraf(process.env.BOT_TOKEN)
const bot = new Telegraf(BOT_TOKEN)

bot.start((ctx) => {
    if (ctx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

    ctx.reply(
        'Добро пожаловать! Выберите действие:',
        Markup.keyboard([
            ['Ближайшие игры'],
            ['Расписание игр на месяц']
        ]).resize());
});

// Обработка кнопки "Ближайшие игры"
bot.hears('Ближайшие игры', (ctx) => {
    if (ctx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

    ctx.reply('Вот ближайшие игры:', Markup.inlineKeyboard([
        [Markup.button.callback('Подробнее о игре 1', 'details_1')],
        [Markup.button.callback('Подробнее о игре 2', 'details_2')]]));
});

// Обработка кнопки "Расписание игр на месяц"
bot.hears('Расписание игр на месяц', (ctx) => {
    if (ctx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

    ctx.reply('Вот расписание всех игр:', Markup.inlineKeyboard([
        [Markup.button.callback('Подробнее о игре 1', 'details_1')],
        [Markup.button.callback('Подробнее о игре 2', 'details_2')],
        [Markup.button.callback('Подробнее о игре 3', 'details_3')],
        [Markup.button.callback('Подробнее о игре 4', 'details_4')]]));
});

// Обработка кнопки "Подробнее" для каждой игры
bot.action(/details_\d+/, (ctx) => {
    const gameId = ctx.match[0].split('_')[1];
    ctx.reply(`Описание игры ${gameId}: \nКартинка и детали.\nВы можете зарегистрироваться.`,
        Markup.inlineKeyboard([
            [Markup.button.callback('Зарегистрироваться', `register_${gameId}`)],
            [Markup.button.callback('Назад', 'back_to_start')]]));
});

// Обработка кнопки "Назад"
bot.action('back_to_start', (ctx) => {
    ctx.reply('Возврат к главному меню:', Markup.keyboard(
        [
            ['Ближайшие игры'],
            ['Расписание игр на месяц']
        ]).resize());
});

// Обработка регистрации
bot.action(/register_\d+/, (ctx) => {
    const gameId = ctx.match[0].split('_')[1]; // Извлекаем ID игры
    ctx.reply(
        'Для регистрации оставьте свои данные:' +
        '\n1. Ваше имя' + '\n2. Почта' + '\n3. Телефон' +
        '\n4. Название команды' + '\n5. Количество человек' +
        '\n6. Промокод (если есть)');

    bot.on('text', async (messageCtx) => {
        if (messageCtx.chat.id.toString() === ADMIN_CHAT_ID) return; // Игнорируем сообщения из админского чата

        const userData = messageCtx.message.text;

        // Информация о пользователе
        const userInfo =
            `Информация о пользователе:` +
            `Имя: ${messageCtx.from.first_name || 'Не указано'}` +
            `Фамилия: ${messageCtx.from.last_name || 'Не указана'}` +
            `Username: @${messageCtx.from.username || 'Не указан'}` +
            `ID: ${messageCtx.from.id}`
        ;

        // Отправка заявки в админский чат с указанием игры и информацией о пользователе
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, `
        Новая заявка на игру №${gameId}:\n\nДанные:\n${userData}\n\n${userInfo}`);

        // Ответ пользователю
        messageCtx.reply(
            'Спасибо! Мы с вами свяжемся, чтобы подтвердить вашу запись.\n\n'
            + 'Подпишитесь на канал и посмотрите расписание игр:',
            Markup.inlineKeyboard([
                [Markup.button.url(
                    'Подписаться на канал',
                    'https://t.me/your_channel')],
                [Markup.button.url('Перейти на портал', 'https://yourportal.com')],
                [Markup.button.callback('Список игр', 'back_to_start')]]));
    });
});


// Запуск бота
bot.launch();
console.log('Бот запущен!');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));