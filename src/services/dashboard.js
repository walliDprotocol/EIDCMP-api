// eslint-disable-next-line arrow-body-style

const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:dashboard');

const { DB } = require('src/database');
const { listTemplateItens } = require('src/services/templateItem');
const { listUsersTaggedByStatus } = require('src/services/template');

const listCAbyAdmin = async (wa) => {
  logDebug(' ********* list CA by Admins ***********');

  try {
    const criteria = { admin: wa };
    let output = await DB.findOne(DataBaseSchemas.CA, criteria, null, null);

    if (!output || output.length <= 0) {
      logError('There is no CA for that user!');
      output = { _id: '' };
      // throw 'There is no CA for that user!';
    }
    logDebug('output ', output);
    return output;
  } catch (ex) {
    logError('Error listing CA');
    throw ex;
  }
};

const listTemplateByAdmin = async (wa) => {
  logDebug(' ********* list templates by Admins ***********');

  try {
    const criteria = { admin: wa, status: { $ne: 'delete' } };
    const output = await DB.find(DataBaseSchemas.TEMPLATE, criteria);

    if (!output || output.length <= 0) {
      logError('There is no template for that user!');
      return [];
    }
    return output;
  } catch (ex) {
    logError('Error create template');
    throw ex;
  }
};

const getDashboard = async (wa) => {
  try {
    logDebug('**** services Dashboard **** ', wa);

    const responseTemplate = {
      ca_name: '',
      ca_creator: '',
      templates: [
        // {
        //   name : "template number 1",
        //   users : {
        // waiting_wallet : [],
        // pending_approval : [],
        // revoke : [],
        // ative : []
        //   }
        // }
      ],
    };

    const caItem = await listCAbyAdmin(wa);
    responseTemplate.cid = caItem._id;
    responseTemplate.ca_name = caItem.name;
    responseTemplate.contract_address = caItem.contract_address || '0x99999999';

    responseTemplate.ca_creator = caItem.creatorWA;
    responseTemplate.img_url = caItem.img_url;

    logDebug('**** listTemplateByAdmin **** ');
    const templateItem = await listTemplateByAdmin(wa);

    //
    await Promise.all(templateItem.map(async (elem) => {
      const templateItens = await listTemplateItens(elem._id.toHexString());
      const templateUsersByStatus = await listUsersTaggedByStatus({ tid: elem._id.toHexString() });

      responseTemplate.templates.push({
        name: elem.name,
        tid: elem._id.toHexString(),
        cid: caItem.cid,
        frontendProps: elem.frontendProps,
        excelTemplate: elem.excelTemplate || 'NA',
        templateItens,
        users: templateUsersByStatus,
      });
      return '';
    }));

    return responseTemplate;
  } catch (ex) {
    logError('Error listing CA');
    throw ex;
  }
};

module.exports = { listCAbyAdmin, listTemplateByAdmin, getDashboard };
