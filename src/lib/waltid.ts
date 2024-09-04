import type { Express } from 'express';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('lib:waltid');

const WALT_ID_API_URL = 'https://issuer.portal.walt.id';

const GENERATE_KEY_PAIR = '/onboard/issuer';

async function createKeyPair() {
  logDebug('createKeyPair');

  const body = {
    key: {
      backend: 'jwk',
      keyType: 'Ed25519',
    },
    did: {
      method: 'jwk',
    },
  };

  const response = await fetch(`${WALT_ID_API_URL}${GENERATE_KEY_PAIR}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),

  });

  const { issuerKey } = await response.json();
  logDebug('issuerKey', issuerKey);

  return issuerKey;
}

export async function initializeWallet(app : Express) {
  const issuerKeyPair = await createKeyPair();
  const { locals } = app;

  locals.issuerKey = issuerKeyPair;
}
