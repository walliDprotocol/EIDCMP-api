// eslint-disable-next-line arrow-body-style

import { TemplateItem } from 'src/types';

const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:dashboard');

const { DB } = require('src/database');
const { listTemplateItens } = require('src/services/templateItem');
const { listUsersTaggedByStatus } = require('src/services/template');

const listCAbyAdmin = async (wa: any) => {
  logDebug(' ********* list CA by Admins ***********');

  try {
    const criteria = { admin: wa };
    let output = await DB.findOne(DataBaseSchemas.CA, criteria, null, null);

    if (!output || output.length <= 0) {
      logError('There is no CA for that user!');
      output = { _id: '' };
      // throw 'There is no CA for that user!';
    }
    return output;
  } catch (ex) {
    logError('Error listing CA');
    throw ex;
  }
};

const listTemplateByCid = async (cid: any) => {
  logDebug(' ********* list templates by Cid ***********');

  try {
    const criteria = { cid };
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

const listTemplateByAdmin = async (wa: any) => {
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

const getDashboard = async (wa: any, filter: 'wa' | 'cid') => {
  try {
    logDebug('**** services Dashboard **** ', wa);

    const caItem = await listCAbyAdmin(wa);
    const responseTemplate: {
      caName: string;
      creatorWA: string;
      templates: TemplateItem[];
      cid: string;
      contractAddress: string;
      imgUrl: string;
      issuerDid: string
    } = {
      caName: caItem.name,
      creatorWA: caItem.creatorWA,
      templates: [],
      cid: caItem._id,
      contractAddress: caItem.contractAddress || caItem.contract_address || '0x99999999',
      imgUrl: caItem.imgUrl,
      issuerDid: caItem.issuerDid,
    };

    logDebug('**** listTemplateByAdmin **** ');
    const templateItem = filter === 'wa' ? await listTemplateByAdmin(wa) : await listTemplateByCid(caItem.cid);

    //
    await Promise.all(templateItem.map(async (elem: { _id: { toHexString: () => any; }; name: any; frontendProps: any;
      excelTemplate: any; createdAt: string; }) => {
      logDebug('**** listTemplateByAdmin **** ', elem);
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
        createdAt: elem.createdAt,
      });
      return '';
    }));

    return responseTemplate;
  } catch (ex) {
    logError('Error listing CA');
    throw ex;
  }
};

export { getDashboard, listCAbyAdmin, listTemplateByAdmin };
