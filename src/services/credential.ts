import { isEmptyObject } from 'src/lib/util';
import config from 'src/config';

const { FRONTEND_URL } = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:credential');

type CredentialOfferUrlParams = {
  credentialConfigurationId: string;
  credentialData: any;
};

const WALTID_ISSUER_API_URL = 'https://issuer.portal.walt.id';
const WALTID_PUBLIC_VERIFIER_URL = 'https://verifier.portal.walt.id/openid4vc/verify';

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

export async function createCredentialVerificationUrl({
  credentialConfigurationType = 'NaturalPersonVerifiableID', format = 'jwt_vc_json', tid = '', guid = '',
}: { credentialConfigurationType?: string, format?: string, tid?: string, guid?: string }) {
  logDebug('createCredentialVerificationUrl', credentialConfigurationType, format, tid);
  const requestCredentials = [{
    type: credentialConfigurationType,
    format,
    // policies: [
    // ],
    input_descriptor: {
      id: credentialConfigurationType,
      format: {
        jwt_vc_json: {
          alg: [
            'EdDSA',
          ],
        },
      },
      constraints: {
        fields: [
          {
            path: [
              '$.credentialSubject.tid',
            ],
            filter: {
              type: 'string',
              pattern: tid, // 66e0de878a539ace8c3624a4
            },
          },
        ],
      },
    },
  },

  ];
  const requestBody = {
    request_credentials: requestCredentials,
  };
  logDebug('requestBody', JSON.stringify(requestBody, null, 2));
  const response = await fetch(WALTID_PUBLIC_VERIFIER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      successRedirectUri: `${FRONTEND_URL}/success/$id?guid=${guid}`,
      errorRedirectUri: `${FRONTEND_URL}/success/$id?guid=${guid}`,
    },
    body: JSON.stringify(requestBody),
    redirect: 'follow',
  });

  if (response.status !== 200) {
    const error = await response.json();
    logError('Error issuing credential', error);
    throw new Error(error.message);
  }

  return response.text();
}
