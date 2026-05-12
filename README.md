# FinControl - Painel Financeiro Integrado com Telegram Bot

Sistema web para controle financeiro pessoal, com dashboard interativo, cadastro de transações, metas, orçamentos, relatórios e integração local com um bot do Telegram.

O projeto foi desenvolvido com **HTML, CSS e JavaScript** no frontend e **Node.js** para o bot/API local.

## Visão Geral

O FinControl ajuda a organizar receitas e despesas em uma interface visual. O usuário pode cadastrar transações pelo dashboard ou registrar lançamentos pelo Telegram Bot, que salva os dados localmente para sincronização com o painel.

## Funcionalidades

### Dashboard Financeiro

- Exibição de saldo atual, receitas, despesas e total de transações
- Gráfico de evolução mensal
- Gráfico de gastos por categoria com Chart.js
- Lista das últimas transações
- Notificações para acompanhamento de orçamentos

### Transações

- Cadastro de receitas e despesas
- Edição e exclusão de transações
- Filtros por período, categoria e busca textual
- Persistência no `localStorage`

### Metas, Orçamentos e Relatórios

- Cadastro e acompanhamento de metas financeiras
- Controle de limites de gastos por categoria
- Relatórios financeiros com visão consolidada
- Preferências de tema, moeda e perfil

### Integração com Telegram Bot

- Registro de transações por mensagem no Telegram
- Armazenamento local em `transactions.json`
- API local para leitura das transações registradas pelo bot
- Sincronização manual pelo dashboard via `syncBotTransactions()`

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript, Chart.js |
| Bot/API local | Node.js, Express, node-telegram-bot-api |
| Persistência | LocalStorage e JSON local |
| Deploy frontend | Vercel |

## Estrutura do Projeto

```text
finances-dashboard-web/
├── bot/
│   ├── bot.js
│   ├── bot.config.example.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── img/
├── dashboard.html
├── dashboard.css
├── dashboard.js
├── transacoes.html
├── transacoes.css
├── transacoes.js
├── orcamentos.html
├── orcamentos.css
├── orcamentos.js
├── metas.html
├── metas.css
├── metas.js
├── relatorios.html
├── relatorios.css
├── relatorios.js
├── login.html
├── signup.html
├── index.html
└── README.md
```

## Como Rodar Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/KaueAlciati/finances-dashboard-web.git
cd finances-dashboard-web
```

### 2. Instale as dependências do bot

```bash
cd bot
npm install
```

### 3. Configure o token do Telegram Bot

Crie um arquivo `bot.config.js` dentro da pasta `bot/`.

Você pode usar o arquivo de exemplo como base:

```bash
cp bot.config.example.js bot.config.js
```

Depois edite o token:

```js
module.exports = {
  TOKEN: "seu-token-do-telegram-bot",
};
```

### 4. Execute o bot e a API local

Em um terminal dentro da pasta `bot/`:

```bash
npm run start:bot
```

Em outro terminal dentro da pasta `bot/`:

```bash
npm run start:api
```

A API local ficará disponível em:

```text
http://localhost:3001/transactions
```

### 5. Abra o dashboard

Abra o arquivo `dashboard.html` no navegador ou use uma extensão como Live Server no VS Code.

Exemplo:

```text
http://127.0.0.1:5500/finances-dashboard-web/dashboard.html
```

## Exemplo de Uso no Telegram

Mensagens aceitas pelo bot:

```text
mercado 50
salario 2500
ifood 15
```

Após o registro, o dashboard pode sincronizar os dados e atualizar saldo, gráficos e lista de transações.

## Arquivos Ignorados

O projeto ignora dependências, configurações privadas e dados locais:

```text
node_modules/
bot/bot.config.js
bot/transactions.json
```

## Roadmap Sugerido

- Melhorar responsividade mobile
- Padronizar textos e terminologia financeira
- Exportar relatórios em CSV
- Exportar relatórios em PDF
- Melhorar validações de formulários
- Adicionar estados vazios mais informativos
- Revisar acessibilidade dos formulários e botões

## Autor

Kauê Alciati

GitHub: [@KaueAlciati](https://github.com/KaueAlciati)

## Licença

Este projeto está sob licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## Status

Projeto em desenvolvimento.
