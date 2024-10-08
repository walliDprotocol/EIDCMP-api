import { Router } from 'express';
import validator from 'src/core-services/parameterValidator';
import { createNewUser } from 'src/services/user';
import { createCredentialOfferUrl } from 'src/services/credential';
import { sendEmailInviteUser } from 'src/services/mailer';
import { UserCredentialType } from 'src/types';
import { DataBaseSchemas } from 'src/types/enums';
import { DB } from 'src/database';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:credential');

const router = Router();

/**
 * Creates a new VC offer url
 */
const PARAMETERS = ['cid', 'tid', 'waAdmin', 'email', 'data'];

router.post('/create', async (req, res) => {
  logDebug('  **  Create VC  **  ');

  if (!req.body.credentialConfigurationId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const {
      cid, tid, waAdmin, data, email,
    } = validator(req.body, PARAMETERS);

    const { newUser, credencialIssuerDetails } : { newUser: UserCredentialType, credencialIssuerDetails: any } = await createNewUser({
      cid,
      tid,
      data,
      email,
      imgArray: req.body.imgArray,
    });

    logDebug('result', newUser);
    const caIssuerKey = await DB.findOne(DataBaseSchemas.CA, { _id: cid }, 'issuerKey issuerDid', null);

    logDebug('caDID', caIssuerKey);
    const body = {
      issuerKey: caIssuerKey.issuerKey,
      issuerDid: caIssuerKey.issuerDid,
      credentialConfigurationId: `${req.body.credentialConfigurationId}_jwt_vc_json`,
      credentialData: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
        ],
        id: newUser.id,
        type: ['VerifiableCredential', req.body.credentialConfigurationId],
        issuanceDate: new Date().toISOString(),
        credentialSubject: newUser,
      },
    };

    logDebug('body', body);

    const response = await createCredentialOfferUrl(body);

    const { credentialUrl } = response;
    logDebug('credentialUrl', credentialUrl);

    // Invite the user via email

    const resultInvite = await sendEmailInviteUser(newUser, { ...credencialIssuerDetails, waAdmin });

    logDebug('result', resultInvite);

    res.status(200).json({ ...resultInvite, credentialUrl });
    // res.status(200).json({ credentialUrl });
  } catch (error:any) {
    // TODO: delete entry from db from createNewUser function call
    logError('Error inviting user: ', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
