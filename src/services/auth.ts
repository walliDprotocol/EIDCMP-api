import { verifyJWT } from 'src/lib/jwt';

import { DB } from 'src/database';
import { filterObject } from 'src/lib/util';
import { DataBaseSchemas, OAuthTypes } from 'src/types/enums';
import * as crypto from 'crypto';

import { ErrorType, errors } from 'src/constants';

const { WRONG_USERNAME_PASSWORD, INVALID_INVITE } = ErrorType;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:auth');
const { issueJWT } = require('src/lib/jwt');

const bcrypt = require('bcryptjs');

function generateKey(size = 32, format = 'base64' as BufferEncoding) {
  const buffer = crypto.randomBytes(size);
  return buffer.toString(format);
}

const billingEntryBody = ({ email, walletAddress } : { email : string, walletAddress: string }) => {
  return {
    create_dca: 2,
    revoke_user: 10,
    update_governance: 1,
    revoke_template: 2,
    create_template: 2,
    owner_email: email,
    owner_wallet: walletAddress,
  };
};

export const issueTokenForUser = (userDetails: any) => {
  // Issues token
  return issueJWT(userDetails.id, userDetails, '24h');
};

export const registerUserAdminInvite = async ({
  username, password, email, adminInvite,
} : { username: string, password: string, email: string, adminInvite: string }) => {
  logDebug('********* registerUser **********', username, password, email);
  try {
    const adminInviteResult = await DB.findOne(DataBaseSchemas.PENDING_INVITES, { _id: adminInvite });
    logDebug('Created adminInviteResult', adminInviteResult.toJSON(), errors.INVALID_INVITE);

    if (!adminInviteResult) {
      throw new Error(INVALID_INVITE);
    }

    if (adminInviteResult.to !== email) {
      throw new Error(INVALID_INVITE);
    }

    const savedUser = await DB.findOne(DataBaseSchemas.AUTH, {
      $or: [{ email: { $regex: new RegExp(`^${email}$`, 'i') } }, { username: { $regex: new RegExp(`^${username}$`, 'i') } }],
    });
    // if user does not exist, create user and account data
    if (!savedUser) {
      const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
      const walletAddress = `0x${generateKey(20, 'hex')}`;
      const newUser = await DB.create(DataBaseSchemas.AUTH, {
        username, email, password: passwordHash, walletAddress, type: 'local',
      });
      logDebug('Created user', newUser.toJSON(), newUser);

      // Create entry in Billing table
      const billingEntry = await DB.findOneAndUpdate(
        DataBaseSchemas.BILLING,
        { owner_email: email },
        billingEntryBody({ email, walletAddress }),
        { upsert: true, new: true },
      );
      logDebug('Created billing entry', billingEntry.toJSON());

      // Create entry in Admin table
      const admin = {
        wa: walletAddress,
        email,
        username,
      };
      logDebug('admin', admin);
      const adminEntry = await DB.findOneAndUpdate(
        DataBaseSchemas.ADMIN,
        { wa: walletAddress, email },
        admin,
        { upsert: true, new: true },
      );

      logDebug('Created admin entry', adminEntry.toJSON());

      // Add user wallet to ca Admins list

      const ca = await DB.findOne(DataBaseSchemas.CA, { _id: adminInviteResult.data.cid });
      logDebug('ca', ca);
      if (ca) {
        const { admin: adminsList } = ca;
        adminsList.push(walletAddress);
        await DB.updateOne(DataBaseSchemas.CA, { _id: ca._id }, { admin: adminsList });
      }

      return {
        username: newUser.username,
        email: newUser.email,
        id: newUser.id,
        walletAddress: newUser.walletAddress,
      };
    }
    throw new Error('User already exists');
  } catch (ex) {
    logError('register new user ', ex);
    throw ex;
  }
};

export const registerUser = async (data: any) => {
  logDebug('********* registerUser **********', data);
  try {
    const savedUser = await DB.findOne(DataBaseSchemas.AUTH, {
      $or: [{ email: { $regex: new RegExp(`^${data.email}$`, 'i') } }, { username: { $regex: new RegExp(`^${data.username}$`, 'i') } }],
    });
    // if user does not exist, create user and account data
    if (!savedUser) {
      const passwordHash = [OAuthTypes.GOOGLE].includes(data.type)
        ? null : bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
      const walletAddress = `0x${generateKey(20, 'hex')}`;
      const newUser = await DB.create(DataBaseSchemas.AUTH, {
        ...data, password: passwordHash, walletAddress, type: 'local',
      });
      logDebug('Created user', newUser.toJSON(), newUser);

      // Create entry in Billing table
      const billingEntry = await DB.findOneAndUpdate(
        DataBaseSchemas.BILLING,
        { owner_email: data.email },
        billingEntryBody({ email: data.email, walletAddress }),
        { upsert: true, new: true },
      );
      logDebug('Created billing entry', billingEntry.toJSON());

      // Create entry in Admin table
      const admin = {
        wa: walletAddress,
        email: data.email,
        username: data.username,
      };
      logDebug('admin', admin);
      const adminEntry = await DB.findOneAndUpdate(
        DataBaseSchemas.ADMIN,
        { wa: walletAddress, email: data.email },
        admin,
        { upsert: true, new: true },
      );

      logDebug('Created admin entry', adminEntry.toJSON());

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

export const userProfile = async (data: any) => {
  logDebug('********* userProfile **********', data);
  try {
    const user = await DB.findOne(DataBaseSchemas.AUTH, { _id: data.id });
    if (!user) {
      throw new Error('User not found');
    }

    const filter = ['id', 'username', 'email', 'walletAddress'];
    const userFiltered = filterObject(user.toJSON(), filter);
    logDebug(' ****user **** after', userFiltered);

    return userFiltered;
  } catch (ex) {
    logError('userProfile ', ex);
    throw ex;
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
