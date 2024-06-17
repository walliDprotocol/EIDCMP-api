import { verifyJWT } from 'src/lib/jwt';

import { DB } from 'src/database';
import { filterObject } from 'src/lib/util';
import { DataBaseSchemas } from 'src/types/enums';
import * as crypto from 'crypto';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:auth');
const { issueJWT } = require('src/lib/jwt');
const { ErrorType: { WRONG_USERNAME_PASSWORD }, errors } = require('src/constants');

const bcrypt = require('bcryptjs');

function generateKey(size = 32, format = 'base64' as BufferEncoding) {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

export const issueTokenForUser = (userDetails: any) => {
  // Issues token
  return issueJWT(userDetails.id, userDetails, '24h');
};

export const registerUser = async (data: any) => {
  logDebug('********* registerUser **********', data);
  try {
    const savedUser = await DB.findOne(DataBaseSchemas.AUTH, {
      $or: [{ email: data.email }, { username: data.username }],
    });
    // if user does not exist, create user and account data
    if (!savedUser) {
      const passwordHash = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
      const walletAddress = `0x${generateKey(20, 'hex')}`;
      const newUser = await DB.create(DataBaseSchemas.AUTH, {
        ...data, password: passwordHash, walletAddress, type: 'local',
      });
      logDebug('Created user', newUser.toJSON());
      return newUser;
    }
    throw new Error('User already exists');
  } catch (ex) {
    logError('register new user ', ex);
    throw ex;
  }
};

export const loginUser = async (data: any) => {
  logDebug('********* loginUser **********', data);
  try {
    const user = await DB.findOne(DataBaseSchemas.AUTH, { username: { $regex: new RegExp(`^${data.username}$`, 'i') }, type: 'local' });
    if (!user) {
      throw new Error(WRONG_USERNAME_PASSWORD);
    }

    if (!user.verifyPassword(data.password)) {
      throw new Error(WRONG_USERNAME_PASSWORD);
    }

    const filter = ['id', 'username', 'email', 'walletAddress'];
    const userFiltered = filterObject(user.toJSON(), filter);
    logDebug(' ****user **** after', userFiltered);

    const tokenObject = await issueTokenForUser(userFiltered);

    return {
      success: true,
      token: tokenObject.token,
      expiresIn: tokenObject.expires,
      walletAddress: userFiltered.walletAddress,
      email: userFiltered.email,
    };
  } catch (ex) {
    logError('loginUser ', ex);
    if (ex instanceof Error) {
      throw new Error(ex.message);
    }
    throw new Error(errors.DEFAULT_LOGIN_ERROR);
  }
};

export async function getApiToken(token: string) {
  const jwt = (await DB.findOne(DataBaseSchemas.TOKEN, { token }))?.jwt;
  logDebug('jwt', jwt);
  if (!jwt) return null;

  return jwt;
}

export async function verifyApiToken(token: string) {
  logDebug('********* verifyApiToken method **********', token);
  try {
    logDebug('token', token);
    if (token) {
      const { jwt } = await DB.findOne(DataBaseSchemas.TOKEN, { token });
      logDebug('jwt', jwt);

      const verify = await verifyJWT(jwt);
      logDebug('verify', verify);
      if (!verify) {
        throw new Error('401');
      }

      return true;
    }
    return false;
  } catch (ex) {
    logError('Error verifyApiToken ', ex);
    throw ex;
  }
}
