const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:template');
const { DB } = require('src/database');

const createTemplate = async (data) => {
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

    const out = JSON.parse(JSON.stringify(await DB.create(DataBaseSchemas.TEMPLATE, input)));

    delete out._id;

    return out;
  } catch (ex) {
    logError('Error create template');
    throw ex;
  }
};

const getTemplate = async (input) => {
  logDebug(' ********* getTemplate *********** criteria ', input);

  try {
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: input.tid }, '', null);

    const users = await DB.find(DataBaseSchemas.USER, { tid: input.tid }, '', null);

    const templateItens = await DB.find(DataBaseSchemas.TEMPLATE_ITEM, { tid: input.tid }, '', null);

    // for each user get the user infraction and update the user object
    const newUsers = await Promise.all(users.map(async (obj) => {
      const { infractions } = await DB.findOne(DataBaseSchemas.USER_INFRACTIONS, { _id: obj.userInfractionsId.toString() }, '', null);

      return { ...obj.toObject(), infractions, id: obj._id.toString() };
    }));
    // await Promise.all(newUsers);
    return { ...template.toObject(), users: newUsers, templateItens };
  } catch (ex) {
    logError('Error create template');
    throw ex;
  }
};

const listUsersTaggedByStatus = async (input) => {
  logDebug(' ********* listUsersTaggedByStatus *********** criteria ', input);

  try {
    const finalUsers = [];

    // List all users for templateId with status pending_approval', 'active', 'revoke'
    // They are in user table!
    const result = await DB.find(DataBaseSchemas.USER, { tid: input.tid }, '', null);
    await Promise.all(result.map(async (obj) => {
      finalUsers.push(({
        user_data: obj.user_data,
        public_field: obj.public_field,
        status: obj.status,
        wa: obj.wa,
        id: obj._id.toString(),
        tid: obj.tid,
        cid: obj.cid,
        imgArray: obj.imgArray || [],
        pdf_url: obj.pdf_url,
        inviteId: obj.inviteId,

      }));
    }));

    return finalUsers;
  } catch (ex) {
    logError('Error create template');
    throw ex;
  }
};

module.exports = {
  createTemplate, listUsersTaggedByStatus, getTemplate,
};
