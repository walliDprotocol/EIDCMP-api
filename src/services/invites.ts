import { DataBaseSchemas } from 'src/types/enums';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('services:invites');

const { sendAdminInvite } = require('src/services/mailer');
const { DB } = require('src/database');

export async function createAdminInviteAndSend(from: string, to: string, name:string) {
  logDebug(' ********* New Invite ***********', from, to, name);

  const [masterAdmin, newAdmin] = await Promise.all([
    DB.findOne(DataBaseSchemas.ADMIN, { email: from, roles: 'admin' }),
    DB.findOne(DataBaseSchemas.ADMIN, { email: to, roles: 'admin' }),
  ]);
  logDebug(masterAdmin, newAdmin);

  if (!masterAdmin._id || newAdmin?._id) throw new Error(`No admin ${from} found with right permissions, or ${to} is already admin`);

  const caDetails = await DB.findOne(DataBaseSchemas.CA, { admin: masterAdmin.wa }, ['name', 'cid']);
  logDebug('caDetails:id', caDetails.toJSON().cid, caDetails.toJSON().name, caDetails.toJSON().cid);

  const inviteDetails = await DB.create(DataBaseSchemas.PENDING_INVITES, {
    from, to, type: 'governance', data: { cid: caDetails.toJSON().cid, name },
  });
  logDebug('inviteDetails', inviteDetails);

  logDebug('caDetails', caDetails);
  return sendAdminInvite(masterAdmin.email, to, {
    inviteId: inviteDetails._id, caName: caDetails.name, name, lang: masterAdmin.lang,
  });
}

export function getSentInvites(from:string) {
  logDebug('getSentInvites', from);

  return DB.find(DataBaseSchemas.PENDING_INVITES, { from, type: 'governance' });
}

export function getReceivedInvites(to:string) {
  logDebug('getReceivedInvites', to);

  return DB.find(DataBaseSchemas.PENDING_INVITES, { to, type: 'governance' });
}
