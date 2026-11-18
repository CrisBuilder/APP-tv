/**
 * DisplayFlow — Servidor de API para M-Pesa Vodacom Moçambique
 * Execução simples: node server/index.js
 */
import http from 'http';
import { MpesaVodacomClient } from './mpesaVodacom.js';

const PORT = process.env.PORT || 3001;
const client = new MpesaVodacomClient();

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req);

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health Check
  if (url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ONLINE', service: 'DisplayFlow M-Pesa Gateway', env: client.env });
  }

  // POST /api/mpesa/c2b - Inicia Pagamento C2B
  if (url.pathname === '/api/mpesa/c2b' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { msisdn, amount, reference, thirdPartyReference } = payload;

        if (!msisdn || !amount || !reference) {
          return sendJson(res, 400, { error: 'Campos msisdn, amount e reference são obrigatórios.' });
        }

        const result = await client.chargeC2B({ msisdn, amount, reference, thirdPartyReference });
        return sendJson(res, 200, result);
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    });
    return;
  }

  // GET /api/mpesa/status - Consulta Status da Transação
  if (url.pathname === '/api/mpesa/status' && req.method === 'GET') {
    try {
      const queryReference = url.searchParams.get('reference');
      if (!queryReference) {
        return sendJson(res, 400, { error: 'Parâmetro reference ausente.' });
      }
      const result = await client.queryStatus({ queryReference });
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Rota 404
  return sendJson(res, 404, { error: 'Endpoint não encontrado.' });
});

server.listen(PORT, () => {
  console.log(`🚀 DisplayFlow M-Pesa Gateway ativo na porta ${PORT} [Ambiente: ${client.env}]`);
});
