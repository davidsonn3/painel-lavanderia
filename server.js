const express = require('express');
const axios = require('axios');
const path = require('node:path');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const API_KEY = process.env.CHAVE_API;
const VMLAV_URL = 'https://apps.vmhub.vmtecnologia.io/vmlav/api/externa/v1/maquinas';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/maquinas', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      erro: 'A chave CHAVE_API não está configurada no ambiente do servidor.',
    });
  }

  const pagina = Number(req.query.pagina ?? 0);
  const quantidade = Number(req.query.quantidade ?? 1000);

  if (!Number.isInteger(pagina) || pagina < 0) {
    return res.status(400).json({ erro: 'pagina deve ser um inteiro maior ou igual a 0.' });
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 1000) {
    return res.status(400).json({ erro: 'quantidade deve ser um inteiro entre 1 e 1000.' });
  }

  try {
    const resposta = await axios.get(VMLAV_URL, {
      headers: { 'x-api-key': API_KEY },
      params: { pagina, quantidade },
      timeout: 15000,
    });

    return res.json(resposta.data);
  } catch (erro) {
    const upstreamStatus = erro.response?.status;
    console.error('Falha na conexão com a VMLAV:', upstreamStatus || erro.code || erro.message);

    return res.status(502).json({
      erro: upstreamStatus
        ? `A API VMLAV respondeu HTTP ${upstreamStatus}. Confira a URL do endpoint e a autorização.`
        : 'Falha na conexão com a VMLAV.',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor disponível na porta ${PORT}.`);
});