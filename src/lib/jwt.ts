import jwt from 'jsonwebtoken';
import config from 'src/config';

const { TOKEN_SECRET } = config;
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('lib:jwt');

/**
 * Issues a JWT for a user. Based on https://medium.com/swlh/everything-you-need-to-know-about-the-passport-jwt-passport-js-strategy-8b69f39014b0
 * @param {*} accountId accountId to issue JWT
 * @param {*} expiresIn expiring period
 * @param {*} payloadValues other props to be added
 */
export function issueJWT(accountId: string, payloadValues: any, expiresIn: string | number) {
  logDebug(`username is ${accountId}, expires in ${expiresIn}, payload: ${JSON.stringify(payloadValues)}`);
  const payload = {
    sub: accountId,
    ...payloadValues,
  };

  const signedToken = jwt.sign(payload, TOKEN_SECRET, {
    expiresIn,
    algorithm: 'HS512',
  });
  logDebug(`jwt ${signedToken}`);

  return {
    token: signedToken,
    expires: expiresIn,
  };
}

export function verifyJWT(token: string) {
  try {
    const result = jwt.verify(token, TOKEN_SECRET);
    logDebug('verify result: ', result);
    return result;
  } catch (error) {
    logError(error);
    return false;
  }
}
