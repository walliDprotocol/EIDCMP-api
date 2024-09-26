import { DataBaseSchemas } from 'src/types/enums';
import config from 'src/config';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:admin');

const { DB } = require('src/database');

const { EMAIL_SENDER: from, DOMAIN_ENV } = config;
const { inviteNewUser } = require('src/services/user');
const { listTemplateItens } = require('src/services/templateItem');
const { randomCode } = require('src/services/utils');

const {
  //  sendEmailNotifyRevoke,
  inviteEmailForDemo,
} = require('src/services/mailer');

const createDemoInvite = async (input) => {
  logDebug('createDemoInvite :  ', input);
  const email = input.email.trim() || '';
  const name = input.name.trim() || '';
  let clickableLink = `${DOMAIN_ENV}/?invite_admin=`;

  // create invite
  const inviteData = {
    username: name,
    email,
  };
    // save invite in table:
  const inviteId = await DB.create(
    DataBaseSchemas.PENDING_INVITES,
    {
      from, to: input.email, type: 'invite_admin', data: inviteData,
    },
  );
  clickableLink += inviteId._id;
  logDebug('After create an invite ', clickableLink);

  // create billing
  const updateBody = {
    create_dca: 2,
    revoke_user: 10,
    update_governance: 1,
    revoke_template: 2,
    create_template: 2,
    owner_email: input.email,
  };
  const updatedBilling = await DB.findOneAndUpdate(
    DataBaseSchemas.BILLING,
    { owner_email: input.email },
    updateBody,
    { upsert: true },
  );
  logDebug('After update Billing', updatedBilling);

  // send email with invite
  await inviteEmailForDemo(from, input.email, {
    link: clickableLink, template: 'NO_TEMPLATE', ca: 'NO_CA', name, lang: 'en',
  });

  return { code: 200, mgs: (`email have been send with sucess ${clickableLink}`) };
};

const prepareImportData = async (templateItens, userData, tid, table_values) => {
  logDebug('*********  prepareImportData ******* ', templateItens, userData);

  const userDataPrepared = [];
  // Adding Credential ID if template have that item
  const o = templateItens.find((elem) => elem.attr && elem.attr.toLowerCase() === 'Credential ID'.toLowerCase());
  if (o) {
    userDataPrepared.push({
      value: await randomCode('8', '##'),
      isPublic: 'false',
      temp_item_id: o._id,
    });
  }

  // loop over all items of a template check if isnt at data throw an error
  templateItens.forEach((elem) => {
    logDebug('Elem ', elem);
    if (elem.attrFormat === 'keyval') {
      let containProperty = false;
      let val = '';
      Object.entries(userData).forEach(([key, value]) => {
        logDebug('key ', key);

        // logDebug(key + ' ' + value); // "a 5", "b 7", "c 9"
        if (elem.attr.toLowerCase() === key.toLowerCase()) {
          containProperty = true;
          val = value;
        }
      });
      logDebug('containProperty ', containProperty);
      if (!containProperty && (elem.isMandatory === 'true' || elem.isMandatory === true)) {
        // logDebug('User data Key ', key, ' value ', value);
        logError(`There is no attr ${elem.attr.toLowerCase()} in template item for template id ${tid}`);
        throw new Error(`There is no attr ${elem.attr.toLowerCase()} in template item for template id ${tid}`);
      }

      userDataPrepared.push({
        value: val,
        isPublic: elem.isPublic,
        // isMandatory: tempItem.isMandatory || 'true',
        temp_item_id: elem._id,
      });
    }
  });

  // add table data for template
  // find item for table get templateItem id and add values supply by input
  if (table_values && table_values.length > 0) {
    // logDebug("Will adding table template ", table_values);
    const tableItem = templateItens.find((elem) => elem.attrFormat.toLowerCase() === 'table');
    if (!tableItem) {
      logError('There isnt table item in this template ', templateItens);
      throw new Error('There isnt table item in this template!');
    }
    userDataPrepared.push({
      temp_item_id: tableItem._id,
      isPublic: tableItem.isPublic,
      values: table_values,
    });
  }
  logDebug('userDataPrepared: ', userDataPrepared);
  return userDataPrepared;
};

/**
 *  1. Check if waAdmin is wallet admin
 *  2. Import data
 *
 */
const importMultiData = async (input) => {
  logDebug('Import multi Data :  ', input);
  // TODO check if the waAdmin is admin
  // loop to import dada call indivually the newinvite data
  const templateItens = await listTemplateItens(input.tid);
  logDebug('Email number #', input.import_data.length);
  logDebug('Template itens ', templateItens);
  // await
  const result = await Promise.all(
    input.import_data.map(async (elem) => {
      const userData = await prepareImportData(templateItens, elem.userData, input.tid, elem.table_values || []);
      const email = elem.email || elem.Email || elem['e-mail'];

      await inviteNewUser(
        {
          tid: input.tid,
          cid: input.cid,
          imgArray: elem.imgArray,
          waAdmin: input.waAdmin,
          email,
          data: userData,
        },
      );
    }),
  );

  return result;
};

/**
 * Validate data when file was parsed
 */
const validateParseFile = async (elements, tid) => {
  logDebug(' *** validateParseFile *** | Number of parsed element #', elements.length);
  const templateItens = await listTemplateItens(tid);
  const result = await Promise.all(
    elements.map(async (elem) => prepareImportData(templateItens, elem.userData, tid, elem.table_values || [])),
  );
  return result;
};

const revokeUser = async (data) => {
  logDebug(' ********* BL:Revoke User (sign user data) ***********');

  try {
    const criteria = { _id: data.id, tid: data.tid };

    const user = await DB.findOne(DataBaseSchemas.USER, criteria, '', null);
    if (!user) {
      throw new Error('There is no user for these userID and pending_approval status');
    }

    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: data.tid }, null, null);
    if (!template) {
      throw new Error('There is no template for this iD');
    }

    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: template.cid }, null, null);
    if (!ca) {
      throw new Error(`There is no CA with ID:${data.cid}`);
    }

    /**
     * Update database revoke status
     */
    const updateBody = {};
    updateBody.status = 'revoke';
    updateBody.revoke_sig = data.revokeSig;
    // update user status and user signature
    const updateUser = await DB.findOneAndUpdate(DataBaseSchemas.USER, { _id: data.id, tid: data.tid }, updateBody, { new: true });

    // send email warning user of revocation
    // const emailName = user.userData.name || user.userData.Name || user.userData.nome || user.userData.Nome || '';
    // await sendEmailNotifyRevoke(from, user.email, {
    //   template: template.name, ca: ca.name, name: emailName, lang: template.lang,
    // });

    return { ...updateUser };
  } catch (ex) {
    logError('*************  error revoke ################');
    throw ex;
  }
};

/**
 * To do if there is an invite from wallid team! doesnt update the status of invite
 */
const acceptOnboardingInvite = async (id, wa) => {
  const invite = await DB.findOne(DataBaseSchemas.PENDING_INVITES, { _id: id });

  if (!invite) {
    return Promise.reject(new Error('Invite does not exist or was already accepted'));
  }

  const admin = {
    wa,
    email: invite.to,
    username: invite.data && invite.data.username ? invite.data.username : '',
  };
  logDebug('Create admin ', { wa, email: invite.to });
  await DB.findOneAndUpdate(DataBaseSchemas.ADMIN, { wa, email: invite.to }, admin, { upsert: true });
  await DB.findOneAndUpdate(DataBaseSchemas.BILLING, { owner_email: admin.email }, { owner_wallet: wa });

  logDebug('Update invite to accept', { _id: id });
  await DB.findOneAndUpdate(DataBaseSchemas.PENDING_INVITES, { _id: id }, { status: 'accepted' });

  return { data: {}, mgs: 'Invite was accepted' };
};

const caBillingStatus = async (ca_id, leftTemplates, leftCredentials) => {
  const templates = await DB.find(DataBaseSchemas.TEMPLATE, { cid: ca_id });
  const users = await DB.find(DataBaseSchemas.USER, { cid: ca_id });

  logDebug('Templates for admin filter ', { cid: ca_id }, users?.length, ' template list ', templates?.length);

  return {
    createdTemplates: templates.length,
    createdCredentials: users.length,
    allowedTemplates: parseInt(leftTemplates, 10) + templates.length,
    allowedCredentials: parseInt(leftCredentials, 10) + users.length,
  };
};

const getAdminProfile = async (wa) => {
  let admin = await DB.findOne(DataBaseSchemas.ADMIN, { wa }, '-_id -createdAt -updatedAt');

  if (!admin) {
    return null;
  }

  const dca = await DB.findOne(DataBaseSchemas.CA, { creatorWA: wa }, ' -createdAt -updatedAt');

  const billing = { balances: [], no_dca: false };

  if (!dca) {
    logDebug('No dca found for admin ', wa);
    return admin;
  }

  if (dca.contract_address === '0x99999999') {
    const balances = await DB.findOne(DataBaseSchemas.BILLING, { owner_wallet: wa }, '-_id -owner_email -owner_wallet');
    billing.balances.push({
      address: dca.contract_address,
      balances: await caBillingStatus(dca._id.toHexString(), balances.create_template, balances.revoke_user),
    });
    billing.no_dca = true;
  }

  if (admin) {
    admin = admin.toObject();
    admin.balances = billing.balances;
    admin.no_dca = billing.no_dca;
  }

  return admin;
};

// TODO: need to be refactored
async function updateBilling(contractAddress: string, balances: any) {
  try {
    const dca = await DB.findOne(DataBaseSchemas.CA, { contractAddress }, ' -createdAt -updatedAt');
    if (!dca) {
      throw new Error('No dca found for this address');
    }

    if (dca.contract_address === '0x99999999') {
      return balances;
    }
    return balances;
  } catch (error) {
    logError(error);
    throw error;
  }
}

export {
  revokeUser,
  importMultiData,
  acceptOnboardingInvite,
  getAdminProfile,
  validateParseFile,
  createDemoInvite, updateBilling,
};
