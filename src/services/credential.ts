import { isEmptyObject } from 'src/lib/util';
import config from 'src/config';
import { getIOInstance } from 'src/app-middleware/socket';

const {
  FRONTEND_URL,
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
  credentialConfigurationType = 'NaturalPersonVerifiableID', format = 'jwt_vc_json', id = '', tid = '', guid = '',
}: { credentialConfigurationType?: string, format?: string, id?:string, tid?: string, guid?: string }) {
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
              pattern: tid,
            },
          },
        ],
      },
    },
  },

  ];

  if (id) {
    requestCredentials[0].input_descriptor.constraints.fields.push({
      path: [
        '$.credentialSubject.id',
      ],
      filter: {
        type: 'string',
        pattern: id,
      },
    });
  }

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
  const { io, users } = getIOInstance();
  try {
    const clients = io.sockets.sockets;
    logDebug('users', users);
    // Access all connected sockets
    const targetSocket = clients.get(users[guid]);
    if (!targetSocket) { throw new Error('Socket not found'); }

    targetSocket.emit('sessionId', { sessionId });
    logDebug('Event sent:', guid, sessionId);

    return sessionId;
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
