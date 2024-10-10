// eslint-disable-next-line arrow-body-style

const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:ca');

const { DB } = require('src/database');

const { createKeyPair } = require('src/lib/waltid');

const createCA = async (data) => {
  logDebug(' ********* Store cert Authority DB *********** ', data);

  try {
    const billing = await DB.findOne(DataBaseSchemas.BILLING, { owner_wallet: data.creatorWA });
    if ((!billing || !billing._id)) {
      logDebug('No billing profile for ', data.creatorWA);
      const err = new Error('Forbidden');
      err.status = 403;
      err.message = 'ERR_NO_BILLING';

      throw err;
    }

    const keyPair = await createKeyPair();
    logDebug('keyPair ', keyPair);

    const ca = await DB.create(DataBaseSchemas.CA, { ...data, ...keyPair });
    return ca.toJSON();
  } catch (ex) {
    logError('Error creating CA', ex);
    throw ex;
  }
};

const updateCA = async (data) => {
  logDebug(' ********* Update CA *********** ', data);

  try {
    const criteria = { _id: data.cid };
    const updateBody = {
      name: data.name,
      imgUrl: data.imgUrl,
    };

    const out = await DB.findOneAndUpdate(DataBaseSchemas.CA, criteria, updateBody, { new: true });

    return out.toJSON();
  } catch (ex) {
    logError('*************  error when create CA ################');
    throw ex;
  }
};

const getAdminsList = async ({ cid }) => {
  logDebug(' ********* Get Admins List *********** ', cid);
  const ca = await DB.findOne(DataBaseSchemas.CA, { _id: cid }, '', {});

  if (!ca) {
    throw new Error('CA not found');
  }

  if (!ca.admin) {
    throw new Error('CA has no admins');
  }
  logDebug('ca', ca);

  const admins = await DB.find(DataBaseSchemas.ADMIN, { wa: { $in: ca.admin } }, 'roles wa username email status', {});

  logDebug('admins', admins);

  return { owners: admins.filter((a) => a.roles.includes('owner')), managers: admins.filter((a) => a.roles.includes('manager')) };
};

module.exports = { createCA, updateCA, getAdminsList };
