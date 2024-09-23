import { DB } from 'src/database';
import { CredentialTemplateType, UserCredentialType } from 'src/types';
import { DataBaseSchemas } from 'src/types/enums';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:template');

export const createTemplate = async (data: CredentialTemplateType) => {
  logDebug(' ********* Store new Template *********** ', data);

  try {
    const input = {
      cid: data.cid,
      name: data.name,
      creatorWa: data.wa,
      lang: data.lang,
      frontendProps: data.frontendProps || {},
      admin: [data.wa],
    };

    const out = await DB.create(DataBaseSchemas.TEMPLATE, input);

    return { ...out.toObject(), tid: out._id.toString() };
  } catch (ex) {
    logError('Error createTemplate');
    throw ex;
  }
};

export const getTemplate = async (input: { tid: string }) => {
  logDebug(' ********* getTemplate *********** criteria ', input);

  try {
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: input.tid }, '', null);

    const users = await DB.find(DataBaseSchemas.USER, { tid: input.tid }, '', null);

    logDebug('users', users);

    const templateItens = await DB.find(DataBaseSchemas.TEMPLATE_ITEM, { tid: input.tid }, '', null);

    const newUsers = users.map((obj: any) => {
      return { ...obj.toObject(), id: obj._id.toString() };
    });
    logDebug('newUsers', newUsers);
    return { ...template.toObject(), users: newUsers, templateItens };
  } catch (ex) {
    logError('Error getTemplate', ex);
    throw ex;
  }
};

export const listUsersTaggedByStatus = async (input: { tid: string }) => {
  logDebug(' ********* listUsersTaggedByStatus *********** criteria ', input);

  try {
    // List all users for templateId with status pending_approval', 'active', 'revoke'
    // They are in user table!
    const result = await DB.find(DataBaseSchemas.USER, { tid: input.tid }, '', null);

    const finalUsers: UserCredentialType[] = result.map(async (obj: any) => {
      return { ...obj.toObject(), id: obj._id.toString() };
    });

    return finalUsers;
  } catch (ex) {
    logError('Error listUsersTaggedByStatus');
    throw ex;
  }
};

export const deleteTemplate = async (input: { tid: string }) => {
  logDebug(' ********* deleteTemplate *********** criteria ', input);

  try {
    await DB.removeAll(DataBaseSchemas.TEMPLATE_ITEM, { tid: input.tid });

    return await DB.remove(DataBaseSchemas.TEMPLATE, { _id: input.tid });
  } catch (ex) {
    logError('Error deleteTemplate');
    throw ex;
  }
};
