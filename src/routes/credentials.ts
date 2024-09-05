import { Router } from 'express';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:vc');

const WALT_ID_API_URL = 'https://issuer.portal.walt.id';

const ISSUE_JWT = '/openid4vc/jwt/issue';

const router = Router();

router.post('/create', async (req, res) => {
  const body = {
    issuerKey: req.app.locals.WaltIdConfig.issuerKey,
    issuerDid: req.app.locals.WaltIdConfig.issuerDid,
    credentialConfigurationId: 'identity_credential_vc+sd-jwt',
    credentialData: req.body,
    selectiveDisclosure: {
      fields: {
        name: {
          sd: true,
        },
      },
      decoyMode: 'NONE',
      decoys: 0,
    },
  };

  logDebug('body', body);
  try {
    const response = await fetch(`${WALT_ID_API_URL}${ISSUE_JWT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'text/plain',
      },
      body: JSON.stringify(body),

    });

    const credentialUrl = await response.text();
    logDebug('credentialUrl:status', await response.status);
    logDebug('credentialUrl', credentialUrl);

    res.status(200).json({ credentialUrl });
  } catch (error) {
    logError('Error issuing credential', error);
    res.status(500).json({ error });
  }
});

export default router;
