/* eslint-disable global-require */
/* eslint-disable func-names */

const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:mailer');

const { SEND_GRID_API_KEY } = require('../config').default;

const languages = {
  en: require('../templates/en/languages'),
  pt: require('../templates/pt/languages'),
  es: require('../templates/es/languages'),
};

// console.log('Email & Password ', emailOrigin,  " Pass : ",  emailPassword );
logDebug('send grid key ', SEND_GRID_API_KEY);
sgMail.setApiKey(SEND_GRID_API_KEY);

// send grid email
const sendMail = function (from, to, subject, message, cc) {
  const msg = {
    to: [to], // Change to your recipient
    from, // Change to your verified sender
    cc: cc || [],
    subject,
    // text: 'and easy to do anywhere, even with Node.js',
    html: message,
  };

  sgMail
    .send(msg)
    .then((m) => {
      logDebug('Send email with success ', m);
    })
    .catch((error) => {
      logError(error);
    });
};

const sendAdminInvite = async function (from, to, details) {
  const message = `<p>You have been invited by <b>${from}</b> to become an administrator of ${details.CA}`;
  const subject = `WalliD: Invite from ${details.CA}`;

  return Promise.resolve(sendMail(from, to, subject, message));
};

const sendEmailInviteUser = async function (from, to, details) {
  logDebug('Send sendEmailInviteUser details ', details);
  // ##NAME##  | user name
  // ##CREADNAME## | template name
  // ##CANAME## | Nome da CA

  const language = languages[details.lang](details);

  let message = fs.readFileSync(path.join(__dirname, 'templates', details.lang, 'emit_license.html'), 'utf8');
  message = message.replace('##NAME##', details.name || '');
  message = message.replace('##CREADNAME##', details.template || '');
  message = message.replace('##CANAME##', details.ca || '');
  message = message.replace('##CLICK_URL##', details.link || '');
  message = message.replace('##_TITLE_##', language.inviteUser.title);
  message = message.replace('##CODE##', details.link?.split('?invite=')[1]);
  message = message.replace('##QRCODE##', details.qrCode);
  // const message = `<p>Your credentical for services <b>${details.template}</b> is ready <br> Please click on link for onboarding <a href='src/{details.link}>Visit WalliD</a>`
  const { subject } = language.inviteUser;

  return Promise.resolve(sendMail(from, to, subject, message));
};

const sendEmailAproveUser = async function (from, to, details) {
  // console.log('Send Emails Details ', details);

  const language = languages[details.lang](details);

  // const message = `<p>Your credentical have been approved <b>${details.template}</b> is ready <br> Please click on link for save credentials <a href='src/{details.link}>Visit WalliD</a>`
  let message = fs.readFileSync(path.join(__dirname, 'templates', details.lang, 'aproved_credential.html'), 'utf8');
  message = message.replace('##NAME##', details.name || '');
  message = message.replace('##CREADNAME##', details.template || '');
  message = message.replace('##CANAME##', details.ca) || '';
  message = message.replace('##CLICK_URL##', details.link || '');

  const { subject } = language.sendEmailApprove;
  return Promise.resolve(sendMail(from, to, subject, message));
};

const sendPedingApprovals = async function (from, to, details) {
  // ##NAME##  | user name
  // ##CREADNAME## | template name
  // ##CANAME## | Nome da CA

  const language = languages[details.lang](details);

  let message = fs.readFileSync(path.join(__dirname, 'templates', details.lang, 'pending_approvals.html'), 'utf8');
  message = message.replace('##CREADNAME##', details.template || '');
  message = message.replace('##CANAME##', details.ca || '');
  message = message.replace('##CANAME##', details.ca || '');
  message = message.replace('##CLICK_URL##', details.link || '');

  // const message = `<p>Your credentical for services <b>${details.template}</b> is ready <br> Please click on link for onboarding <a href='src/{details.link}>Visit WalliD</a>`
  const { subject } = language.pendingAprovals;

  return Promise.resolve(sendMail(from, to, subject, message));
};

const sendEmailNotifyRevoke = async function (from, to, details) {
  // console.log('revoke email details ', details);

  const language = languages[details.lang](details);

  // const message = `<p>Your credentical for template : <b>${details.template}</b> have been revoked! <br> Contact your admin for further information!`
  let message = fs.readFileSync(path.join(__dirname, 'templates', details.lang, 'revoke_user.html'), 'utf8');
  message = message.replace('##CREADNAME##', details.template || '');
  message = message.replace('##CANAME##', details.ca || '');
  message = message.replace('##NAME##', details.name || '');

  // A sua credencial [Credential name] da [credential issuer] foi revogada
  const { subject } = language.credentialRevoke;

  return Promise.resolve(sendMail(from, to, subject, message));
};

const inviteEmailForDemo = async function (from, to, details) {
  // console.log('revoke email details ', details);

  const language = languages[details.lang](details);

  // const message = `<p>Your credentical for template : <b>${details.template}</b> have been revoked! <br> Contact your admin for further information!`
  let message = fs.readFileSync(path.join(__dirname, 'templates', details.lang, 'demo_invite.html'), 'utf8');
  message = message.replace('##NAME##', details.name || '');
  message = message.replace('##CREADNAME##', details.template || '');
  message = message.replace('##CANAME##', details.ca || '');
  message = message.replace('##CLICK_URL##', details.link || '');
  message = message.replace('##_TITLE_##', language.demoInvite.title);

  // A sua credencial [Credential name] da [credential issuer] foi revogada
  const { subject } = language.demoInvite;

  return Promise.resolve(sendMail(from, to, subject, message));
};

module.exports = {
  sendEmailInviteUser,
  sendAdminInvite,
  sendEmailAproveUser,
  sendEmailNotifyRevoke,
  sendPedingApprovals,
  inviteEmailForDemo,
};
