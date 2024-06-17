import { DataBaseSchemas } from 'src/types/enums';

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('services:invites');

const { sendAdminInvite } = require('src/services/mailer');
const { DB } = require('src/database');

export function createAdminInviteAndSend(from, to) {
  logDebug(' ********* New Invite ***********');

  return Promise.all([
    DB.findOne(DataBaseSchemas.ADMIN, { email: from, roles: 'admin' }),
    DB.findOne(DataBaseSchemas.ADMIN, { email: to, roles: 'admin' }),
  ])
    .then((admins) => {
      if (admins[0]._id && !admins[1]._id) {
        return DB.create(DataBaseSchemas.PENDING_INVITES, { from, to, type: 'governance' })
          .then(() => Promise.resolve(admins[0]._id));
      }

      return Promise.reject(new Error(`No admin ${from} found with right permissions, or ${to} is already admin`));
    })
    .then((adminID) => DB.findOne(DataBaseSchemas.CA, { admins: adminID }, 'name'))
    .then((details) => sendAdminInvite(from, to, { CA: details.name }));
}
