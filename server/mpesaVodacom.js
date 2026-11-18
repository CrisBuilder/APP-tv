/**
 * DisplayFlow — Adaptador Oficial de Backend para M-Pesa Moçambique (Vodacom)
 * Documentação: https://developer.mpesa.vm.co.mz/documentation/
 */
import crypto from 'crypto';
import https from 'https';

export class MpesaVodacomClient {
  constructor(config = {}) {
    this.env = config.env || process.env.MPESA_ENV || 'sandbox'; // 'sandbox' | 'live'
    this.apiKey = config.apiKey || process.env.MPESA_API_KEY || '';
    this.publicKey = config.publicKey || process.env.MPESA_PUBLIC_KEY || '';
    this.serviceProviderCode = config.serviceProviderCode || process.env.MPESA_SERVICE_PROVIDER_CODE || '';
    this.initiatorIdentifier = config.initiatorIdentifier || process.env.MPESA_INITIATOR_IDENTIFIER || '';
    this.securityCredential = config.securityCredential || process.env.MPESA_SECURITY_CREDENTIAL || '';

    // Hosts oficiais da Vodacom Moçambique
    this.host = this.env === 'live' ? 'api.vm.co.mz' : 'api.sandbox.vm.co.mz';
    this.c2bPort = 18352;
    this.statusPort = 18353;
    this.reversalPort = 18354;
  }

  /**
   * Gera o Bearer Token criptografando a API Key com a Public Key RSA da Vodacom
   * Padding: RSA_PKCS1_PADDING (conforme especificação oficial Java do portal)
   */
  generateBearerToken() {
    if (!this.apiKey || !this.publicKey) {
      throw new Error('M-Pesa: API Key ou Public Key ausentes para geração de Bearer Token.');
    }

    // Formata a chave pública se não tiver os delimitadores PEM
    let formattedKey = this.publicKey.trim();
    if (!formattedKey.includes('-----BEGIN PUBLIC KEY-----')) {
      formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
    }

    const buffer = Buffer.from(this.apiKey, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: formattedKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );

    return encrypted.toString('base64');
  }

  /**
   * Executa a chamada C2B (Customer to Business) para debitar no telemóvel do cliente
   */
  async chargeC2B({ msisdn, amount, reference, thirdPartyReference }) {
    const bearer = this.generateBearerToken();
    const payload = JSON.stringify({
      input_TransactionReference: reference,
      input_CustomerMSISDN: msisdn,
      input_Amount: String(Math.round(amount)), // Meticais inteiros
      input_ThirdPartyReference: thirdPartyReference || reference,
      input_ServiceProviderCode: this.serviceProviderCode
    });

    const options = {
      hostname: this.host,
      port: this.c2bPort,
      path: '/ipg/v1x/c2bPayment/singleStage/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'Origin': '*',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 60000
    };

    return this._request(options, payload);
  }

  /**
   * Consulta o status de uma transação
   */
  async queryStatus({ queryReference, thirdPartyReference }) {
    const bearer = this.generateBearerToken();
    const path = `/ipg/v1x/queryTransactionStatus/?input_QueryTransactionID=${encodeURIComponent(queryReference)}&input_ServiceProviderCode=${encodeURIComponent(this.serviceProviderCode)}&input_ThirdPartyReference=${encodeURIComponent(thirdPartyReference || queryReference)}`;

    const options = {
      hostname: this.host,
      port: this.statusPort,
      path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Origin': '*'
      },
      timeout: 45000
    };

    return this._request(options);
  }

  /**
   * Executa reversão/estorno de pagamento
   */
  async reverseTransaction({ transactionId, amount, thirdPartyReference }) {
    const bearer = this.generateBearerToken();
    const payload = JSON.stringify({
      input_TransactionID: transactionId,
      input_ReversalAmount: String(Math.round(amount)),
      input_ServiceProviderCode: this.serviceProviderCode,
      input_ThirdPartyReference: thirdPartyReference || `REV-${Date.now()}`,
      input_InitiatorIdentifier: this.initiatorIdentifier,
      input_SecurityCredential: this.securityCredential
    });

    const options = {
      hostname: this.host,
      port: this.reversalPort,
      path: '/ipg/v1x/reversal/',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'Origin': '*',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 60000
    };

    return this._request(options, payload);
  }

  _request(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Tempo limite excedido na comunicação com a API M-Pesa Vodacom.'));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
}
