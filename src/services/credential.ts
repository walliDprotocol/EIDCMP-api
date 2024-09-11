import { isEmptyObject } from 'src/lib/util';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:credential');

type CredentialOfferUrlParams = {
  credentialConfigurationId: string;
  credentialData: any;
};

const WALTID_ISSUER_API_URL = 'https://issuer.portal.walt.id';

const ISSUE_JWT = '/openid4vc/jwt/issue';
export async function createCredentialOfferUrl(body: CredentialOfferUrlParams) {
  if (!body.credentialConfigurationId || isEmptyObject(body.credentialData)) {
    throw new Error('Missing required fields');
  }

  logDebug('🚀 -> createCredentialOfferUrl -> body:', body);

  try {
    const response = await fetch(`${WALTID_ISSUER_API_URL}${ISSUE_JWT}`, {
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

    return { credentialUrl };
  } catch (error) {
    logError('Error issuing credential', error);
    throw error;
  }
}
