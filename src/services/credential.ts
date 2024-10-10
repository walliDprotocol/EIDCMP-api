import { isEmptyObject } from 'src/lib/util';
import config from 'src/config';
import { PubNub } from 'wallid-certishop';

const {
  FRONTEND_URL, PUBNUB_SUB_KEY, PUBNUB_PUB_KEY, PUBNUB_USER_ID,
} = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:credential');

type CredentialOfferUrlParams = {
  credentialConfigurationId: string;
  credentialData: any;
};

const WALTID_ISSUER_API_URL = 'https://issuer.portal.walt.id';
const WALTID_PUBLIC_VERIFIER_URL = 'https://verifier.portal.walt.id';

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
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
  const response = await fetch(`${WALTID_PUBLIC_VERIFIER_URL}/openid4vc/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      successRedirectUri: `${FRONTEND_URL}/api/v1/credential/redirect/$id?guid=${guid}`,
      errorRedirectUri: `${FRONTEND_URL}/api/v1/credential/redirect/$id?guid=${guid}`,
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

export async function sendSessionToken(guid: string, sessionId: string) {
  const pubnub = new PubNub({
    publishKey: PUBNUB_PUB_KEY,
    subscribeKey: PUBNUB_SUB_KEY,
    userId: PUBNUB_USER_ID,
  });

  try {
    const result = await pubnub.publish({
      channel: guid,
      message: { sessionId },
    });

    logDebug('Evento publicado com sucesso:', result);

    return result;
  } catch (error) {
    logError('Erro ao publicar evento:', error);

    throw error;
  }
}

export async function getSessionData(sessionId:string) {
  logDebug('getSessionData', sessionId);

  const response = await fetch(`${WALTID_PUBLIC_VERIFIER_URL}/openid4vc/session/${sessionId}`);
  logDebug('response', response);

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  logDebug('data', data);

  const parsedToken = parseJwt(data.tokenResponse.vp_token);
  const containsVP = !!parsedToken.vp?.verifiableCredential;
  const vcs = containsVP
    ? parsedToken.vp?.verifiableCredential
    : [data.tokenResponse.vp_token];

  return Array.isArray(vcs)
    ? vcs.map((vc: string) => {
      if (typeof vc !== 'string') {
        logError(
          'Invalid VC format: expected a string but got',
          vc,
        );
        return vc;
      }
      const split = vc.split('~');
      const parsed = parseJwt(split[0]);

      if (split.length === 1) return parsed.vc ? parsed.vc : parsed;

      const credentialWithSdJWTAttributes = { ...parsed };
      split.slice(1).forEach((item) => {
        // If it is key binding jwt, skip
        if (item.split('.').length === 3) return;

        const parsedItem = JSON.parse(
          Buffer.from(item, 'base64').toString(),
        );
        credentialWithSdJWTAttributes.credentialSubject = {
          [parsedItem[1]]: parsedItem[2],
          ...credentialWithSdJWTAttributes.credentialSubject,
        };
        // credentialWithSdJWTAttributes.credentialSubject._sd.map((sdItem: string) => {
        //   if (sdItem === parsedItem[0]) {
        //     return `${parsedItem[1]}: ${parsedItem[2]}`
        //   }
        //   return sdItem;
        // })
      });
      return credentialWithSdJWTAttributes;
    })
    : [];
}
