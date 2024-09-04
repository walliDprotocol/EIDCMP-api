import express, { Router } from 'express';
import mongoose, { mongo } from 'mongoose';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:key');

const WALT_ID_API_URL = 'https://issuer.portal.walt.id';

const GENERATE_KEY_PAIR = '/onboard/issuer';

const router = Router();
const app = express();

const KeyPair = new Set();

router.post('/create', async (req, res) => {
  logDebug('create', req.body);

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
  KeyPair.add(issuerKey);

  app.locals.issuerKey = issuerKey;

  res.status(200).json(issuerKey);
});

router.delete('deactivate', async (req, res) => {
  logDebug('deactivate', req.body);
  res.status(200).json(req.body);
});

router.post('reactivate', async (req, res) => {
  logDebug('activate', req.body);
  res.status(200).json(req.body);
});

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  logDebug('filename', fileId);
});

export default router;
