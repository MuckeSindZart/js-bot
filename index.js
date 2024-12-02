const {Telegraf} = require('telegraf');
const {initializeUserBot} = require('./userBot');
const {initializeAdminBot} = require('./adminBot');
require('dotenv').config();

//ID админского чата
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
//ID бота
const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);

// Инициализация клиентской и админской
initializeUserBot(bot, ADMIN_CHAT_ID);
initializeAdminBot(bot, ADMIN_CHAT_ID);

// Запуск бота
bot.launch();
console.log('Бот запущен!');

// Остановка бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
