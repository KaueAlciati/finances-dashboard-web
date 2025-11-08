// bot/bot.js
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./bot.config');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// arquivo onde vamos guardar as transações
const DATA_PATH = path.join(__dirname, 'transactions.json');

// helper para ler/salvar
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (e) {
    return {}; // { chatId: [ {date, description, value, type} ] }
  }
}
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Olá, ${msg.from.first_name || ''}! 👋

Digite suas transações assim:
mercado 100
aluguel 1200
salario 2500

Por enquanto isso só fica salvo aqui no bot (vamos ligar no painel depois).`
  );
});

// qualquer mensagem de texto tipo "mercado 100"
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // ignora comandos (/start etc)
  if (msg.text.startsWith('/')) return;

  const text = msg.text.trim();

  // tenta casar: descrição + valor
  const match = text.match(/^(.+)\s+([\d.,]+)$/);
  if (!match) {
    bot.sendMessage(
      chatId,
      'Formato esperado: descrição valor\nExemplos:\nmercado 150.75\nuber 32,50\nsalario 2500'
    );
    return;
  }

  const description = match[1].trim();
  const rawValue = match[2].replace('.', '').replace(',', '.');
  const value = parseFloat(rawValue);

  if (isNaN(value) || value <= 0) {
    bot.sendMessage(chatId, 'Valor inválido. Tenta algo como "mercado 100".');
    return;
  }

  // regra simples: se descrição lembrar "salario" ou "renda" = receita, senão = despesa
  const lower = description.toLowerCase();
  const type =
    lower.includes('salario') || lower.includes('renda') || lower.includes('salário')
      ? 'income'
      : 'expense';

  const tx = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    description,
    value,
    type,
  };

  const data = loadData();
  if (!data[chatId]) data[chatId] = [];
  data[chatId].push(tx);
  saveData(data);

  bot.sendMessage(
    chatId,
    `✅ Registrado: ${description} - R$ ${value.toFixed(2)} (${type === 'expense' ? 'despesa' : 'receita'})`
  );
});

console.log('Bot do FinControl rodando...');
