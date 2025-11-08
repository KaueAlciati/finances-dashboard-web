const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

// GET /transactions -> lê o JSON e devolve
app.get('/transactions', (req, res) => {
  const file = path.join(__dirname, 'transactions.json');

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler transactions.json', err);
      return res.status(500).json({ error: 'Erro ao ler transactions' });
    }

    try {
      const json = JSON.parse(data || '[]');
      res.json(json);
    } catch (e) {
      console.error('JSON inválido em transactions.json', e);
      res.status(500).json({ error: 'JSON inválido' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`API do bot rodando em http://localhost:${PORT}`);
});
