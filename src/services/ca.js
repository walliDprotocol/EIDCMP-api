// eslint-disable-next-line arrow-body-style

const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:ca');

const { DB } = require('src/database');

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
    } else {
      const out = JSON.parse(JSON.stringify(await DB.create(DataBaseSchemas.CA, data)));
      logDebug('CA Was created ', out);

      return out;
    }
  } catch (ex) {
    logError('*************  error when create CA ################');
    throw ex;
  }
};

const updateCA = async (data) => {
  logDebug(' ********* Update CA *********** ', data);

  try {
    const criteria = { _id: data.cid };
    const updateBody = {
      name: data.name,
      img_url: data.img_url,
    };

    const out = await DB.findOneAndUpdate(DataBaseSchemas.CA, criteria, updateBody, { new: true });

    return out;
  } catch (ex) {
    logError('*************  error when create CA ################');
    throw ex;
  }
};

module.exports = { createCA, updateCA };
