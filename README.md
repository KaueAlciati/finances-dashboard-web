# 💸 FinControl — Painel Financeiro Integrado com Telegram Bot

> Sistema web completo para controle financeiro pessoal, com integração direta ao Telegram Bot para registro de transações via chat.  
> Desenvolvido em **HTML, CSS e JavaScript** (frontend) + **Node.js** (bot e API local).

---

## 🚀 **Visão Geral**

O **FinControl** permite gerenciar suas finanças de forma simples e automatizada.  
Você pode registrar receitas e despesas diretamente pelo Telegram, e o dashboard web atualiza os dados em tempo real, exibindo saldo, gráficos e estatísticas mensais.

---

## 🧩 **Funcionalidades Principais**

### 💬 Integração com Telegram Bot
- Registrar transações pelo chat (ex: `mercado 50` ou `salário 2500`);
- O bot salva automaticamente os dados em `transactions.json`;
- O dashboard sincroniza e exibe as transações em tempo real.

### 📊 Dashboard Web
- Visualização de **saldo atual**, **receitas**, **despesas** e **transações totais**;
- Gráfico de **evolução mensal** e **gasto por categoria** (via Chart.js);
- Tabelas com últimas transações e notificações inteligentes.

### 🧾 Orçamentos, Metas e Relatórios
- Controle de metas financeiras e limites de gastos;
- Emissão de relatórios mensais;
- Sistema de notificações de orçamentos.

### 🧠 Preferências e Perfil
- Personalização de tema (claro/escuro);
- Alteração de moeda (BRL, USD, EUR);
- Avatar e dados de perfil persistentes via `localStorage`.

---

## ⚙️ **Arquitetura do Projeto**

finances-dashboard-web/
│
├── bot/ # Integração com Telegram
│ ├── bot.js # Lógica principal do bot
│ ├── bot.config.js # Configurações privadas (token do bot)
│ ├── server.js # API local para leitura de transactions.json
│ ├── package.json # Dependências do Node.js
│ └── transactions.json # Armazena transações registradas via Telegram
│
├── img/ # Imagens e ícones do dashboard
├── dashboard.html # Painel principal
├── dashboard.js # Lógica do dashboard + integração do bot
├── dashboard.css # Estilos do painel
├── orcamentos.html / js / css
├── metas.html / js / css
├── relatorios.html / js / css
├── login.html / js / css
├── signup.html / js / css
└── README.md

---

## 🧠 **Tecnologias Utilizadas**

| Camada | Tecnologias |
|--------|--------------|
| Frontend | HTML5 · CSS3 · JavaScript (ES6+) · Chart.js |
| Backend (Bot/API) | Node.js · Express · node-telegram-bot-api |
| Armazenamento | JSON local (`transactions.json`) + LocalStorage |
| Design System | Dark/Light Mode · Paleta customizável |
| Ferramentas | VSCode · Git · Telegram API · npm scripts |

---

## 🧰 **Como Rodar o Projeto**

### 🔹 1. Clonar o repositório

git clone https://github.com/KaueAlciati/finances-dashboard-web.git
cd finances-dashboard-web

### 🔹 2. Instalar dependências do bot

cd bot
npm install

### 🔹 3. Configurar o token do bot

Crie um arquivo bot.config.js dentro da pasta bot/ com o seguinte conteúdo:

module.exports = {
  TOKEN: 'seu-token-do-telegram-bot'
};

### 🔹 4. Executar os serviços

Em dois terminais separados, rode:

npm run start:bot
npm run start:api

### 🔹 5. Iniciar o Dashboard

Abra o arquivo:
/finances-dashboard-web/dashboard.html
ou execute via Live Server (VSCode):
http://127.0.0.1:5500/finances-dashboard-web/dashboard.html
O dashboard buscará as transações no endpoint:
http://localhost:3001/transactions

---

## 💡 **Exemplo de Uso no Telegram**

## 📱 Mensagem no bot

mercado 50
salario 2500
ifood 15

📊 Resultado no painel:
    Saldo atualizado automaticamente
    Gráficos e totais recalculados
    Transação listada como despesa ou receita conforme o texto

---

## 🔒 **.gitignore**

O projeto ignora dados sensíveis e dependências:
node_modules/
bot/bot.config.js
bot/transactions.json

---

## 🧠 **Comandos Úteis**

| Comando                                  | Descrição                                            |
| ---------------------------------------- | ---------------------------------------------------- |
| `npm run start:bot`                      | Inicia o bot do Telegram                             |
| `npm run start:api`                      | Inicia o servidor local (porta 3001)                 |
| `syncBotTransactions()`                  | Força a sincronização manual no console do dashboard |
| `git add .` / `git commit -m "mensagem"` | Versionamento e upload pro GitHub                    |

---

## 🧑‍💻 **Autor**

Kauê Alciati
📍 Desenvolvedor Full Stack · Estudante de ADS
📎 GitHub: @KaueAlciati

---

## 🏁 **Licença**

Este projeto é de uso educacional e pessoal, podendo ser adaptado livremente mediante atribuição de autoria.

---

## ✨ **Status do Projeto**

🟢 Versão atual: Integração completa entre Dashboard e Bot (v1.0)
📅 Última atualização: Novembro/2025
