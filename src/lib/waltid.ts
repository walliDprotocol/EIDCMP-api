import type { Express, Locals } from 'express';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('lib:waltid');

const WALT_ID_API_URL = 'https://issuer.portal.walt.id';

const GENERATE_KEY_PAIR = '/onboard/issuer';

export async function createKeyPair() : Promise<Locals['WaltIdConfig']> {
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

  }).then((data) => data.json());

  logDebug('response', response);

  return response;
}

export async function initializeWallet(app : Express) {
  logDebug('initializeWallet');
  const keyPair = await createKeyPair();
  const { locals } = app;

  locals.WaltIdConfig = { ...keyPair };
}
