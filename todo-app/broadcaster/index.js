const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const NATS = require('nats');
const jc = NATS.JSONCodec();
let chatIds = [];

/*
Need to /start the bot to set chatId before it can send broadcast messages.
If multiple replicas are running the welcome message might be sent multiple times.
The broadcast messages will however be sent at most once.
To ensure all the replicas have the chatIds and work properly might need to /start multiple times.
To fix this, chatIds should be stored in a database etc. and shared between replicas?
Could also just hardcode the chatIds and disable polling...
*/
bot.onText(/\/start/, (msg) => {
  if (!chatIds.includes(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Welcome to the Todo App Bot!");
    chatIds.push(msg.chat.id);
    console.log(chatIds);
  } else {
    bot.sendMessage(msg.chat.id, "You are already subscribed to the Todo App Bot!");
  }
});

bot.on('polling_error', (err) => { });

const main = async () => {
  const nc = await NATS.connect({
    servers: process.env.NATS_URL || 'nats://my-nats:4222'
  });
  console.log(`Connected to NATS at ${nc.getServer()}`);
  const sub = nc.subscribe('todo', { queue: 'todos' });
  for await (const msg of sub) {
    const payload = jc.decode(msg.data);
    console.log(payload);
    for (const chatId of chatIds) {
      bot.sendMessage(chatId, `A task was ${payload.action}: \n\n ${JSON.stringify(payload.todo, null, 4)}`);
    }
  };
};
main();