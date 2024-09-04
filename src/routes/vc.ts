import { Router } from 'express';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:vc');

const WALT_ID_API_URL = 'https://issuer.portal.walt.id';

const ISSUE_JWT = '/openid4vc/jwt/issue';

const router = Router();

router.put('/update', async (req, res) => {
  const body = {
    issuerKey: req.app.locals.issuerKey,
    issuerDid: 'did:key:z6MkjoRhq1jSNJdLiruSXrFFxagqrztZaXHqHGUTKJbcNywp',
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

  res.status(200).json(credentialUrl);
});

export default router;
