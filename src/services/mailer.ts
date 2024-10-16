/* eslint-disable global-require */
/* eslint-disable func-names */
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import config from 'src/config';
import { UserCredentialType } from 'src/types';
import { DataBaseSchemas } from 'src/types/enums';
import { DB } from 'src/database';
import { getFile, uploadFile } from 'src/services/ftp';
import { streamToBuffer } from 'src/lib/util';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:mailer');

const { SEND_GRID_API_KEY, EMAIL_SENDER } = config;

const languages: Record<string, any> = {
  en: require('../templates/en/languages'),
  pt: require('../templates/pt/languages'),
  es: require('../templates/es/languages'),
};

export type SendEmailParams = {
  from: string;
  to: string;
  lang: string;
  name: string;
  templateName: string;
  caName: string;
};

export type CredencialIssuerDetails = {
  tid: string;
  cid: string;
  waAdmin: string;
  templateName: string;
  caName: string;
  lang: string;
};

function generateLink({ assetId }: { assetId: string }) {
  return `${config.USER_INVITE}/${assetId}`;
}

// console.log('Email & Password ', emailOrigin,  " Pass : ",  emailPassword );
logDebug('send grid key ', SEND_GRID_API_KEY);
sgMail.setApiKey(SEND_GRID_API_KEY);

// send grid email
const sendMail = function (from: string, to: string, subject: string, message: string, attachments: any = [], cc = []) {
  const msg: MailDataRequired = {
    to: [to], // Change to your recipient
    from, // Change to your verified sender
    cc,
    subject,
    html: message,
    attachments,
  };

  return sgMail
    .send(msg)
    .then((m) => {
      logDebug('Send email with success ', m);
      return m;
    })
    .catch((error) => {
      logError(error);
    });
};

export const sendAdminInvite = async function (fromEmail: string, to: string, details : any) {
  const from = EMAIL_SENDER || 'WalliD - Credentials <credentials@wallid.io>';

  logDebug('Send sendAdminInvite details ', details);
  const link = `${config.ADMIN_INVITE}${details.inviteId}`;

  logDebug('Link', link);

  const language = languages[details.lang || 'en']({
    from: fromEmail,
    ca: details.caName,
  });

  const templatePath = path.join(__dirname, 'templates', details.lang || 'en', 'invite_admin.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { title, subject } = language.adminInvite;

  const message = templateContent
    .replaceAll('##CANAME##', details.caName)
    .replace('##CLICK_URL##', link)
    .replace('##_TITLE_##', title)
    .replace('##EMAIL##', fromEmail)
    .replace('##NAME##', details.name);

  await sendMail(from, to, subject, message);

  return {
    data: {
      mgs: `The invite ${details.inviteId} was sent!`,
      inviteId: details.inviteId,
    },
  };
};

export const sendEmailInviteUser = async function (
  newUser:UserCredentialType & { email: string, },
  credencialIssuerDetails: CredencialIssuerDetails & { credentialUrl: string },
) {
  const from = EMAIL_SENDER || 'WalliD - Credentials <credentials@wallid.io>';

  const inviteData = {
    userId: newUser.id,
    tid: newUser.tid.trim(),
    cid: newUser.cid.trim(),
    waAdmin: credencialIssuerDetails.waAdmin.trim(),
  };
    // save invite in table:
  const inviteId = await DB.create(DataBaseSchemas.PENDING_INVITES, {
    from, to: newUser.email, type: 'invite_user', data: inviteData,
  });
  logDebug('InviteId', inviteId.toJSON());

  const verifyLink = generateLink({ assetId: inviteId._id });
  logDebug('verifyLink', verifyLink);

  const qrCodeCredentialBuffer = await qrcode.toBuffer(`${credencialIssuerDetails.credentialUrl}`, { type: 'png' });
  const { url: qrCodeCredential } = await uploadFile(`qrCode_${inviteId._id}`, { buffer: Buffer.from(new Uint8Array(qrCodeCredentialBuffer)) });

  const qrCodeVerifyBuffer = await qrcode.toBuffer(`${verifyLink}`, { type: 'png' });
  const { url: qrCodeVerify } = await uploadFile(`qrCode_${inviteId._id}_verify`, { buffer: Buffer.from(new Uint8Array(qrCodeVerifyBuffer)) });
  logDebug('qrCode url', qrCodeCredential);
  logDebug('qrCode url', qrCodeVerify);
  logDebug('Invite Data ', inviteData);

  await setTimeout(() => {}, (Math.floor(Math.random() * 6) + 2) * 1000);

  logDebug('Send sendEmailInviteUser details ', credencialIssuerDetails);

  const language = languages[credencialIssuerDetails.lang]({
    template: credencialIssuerDetails.templateName,
    ca: credencialIssuerDetails.caName,
  });

  const templatePath = path.join(__dirname, 'templates', credencialIssuerDetails.lang, 'invite_user.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { title, subject } = language.inviteUser;
  logDebug('Send newUser details ', newUser);

  const emailNameKey = Object.keys(newUser.userData).find((key) => ['nome', 'name', 'nombre'].includes(key.toLowerCase())) || '';
  const name = newUser.userData[emailNameKey];

  const message = templateContent
    .replace('##NAME##', name)
    .replace('##CERTNAME##', credencialIssuerDetails.templateName)
    .replace('##CANAME##', credencialIssuerDetails.caName)
    .replace('##VERIFY_URL##', verifyLink)
    .replace('##CREDENTIALURL##', credencialIssuerDetails.credentialUrl)
    .replace('##_TITLE_##', title)
    .replace('##QRCODECREDENTIAL##', qrCodeCredential)
    .replace('##QRCODEVERIFY##', qrCodeVerify);

  const attachments = newUser.imgArray.map(async (img) => {
    const bucketReadStream = await getFile(img.split('ftp/')[1]);
    const arrayBuffer = await streamToBuffer(bucketReadStream);
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    return {
      content: base64String,
      filename: 'image.png',
      type: 'image/png',
      disposition: 'attachment',
    };
  });
  await sendMail(from, newUser.email, subject, message, await Promise.all(attachments));

  return {
    data: {
      mgs: `The invite ${inviteId._id} was sent!`,
      inviteId: inviteId._id,
    },
  };
};

export const sendEmailAproveUser = async ({
  from,
  to,
  lang,
  name,
  templateName,
  caName,
  link,
}: SendEmailParams & { link: string }) => {
  const language = languages[lang]({ template: templateName });
  const templatePath = path.join(__dirname, 'templates', lang, 'aproved_credential.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { subject } = language.sendEmailApprove;
  const message = templateContent
    .replace('##NAME##', name)
    .replace('##CREADNAME##', templateName)
    .replace('##CANAME##', caName)
    .replace('##CLICK_URL##', link);

  return sendMail(from, to, subject, message);
};

export const sendPendingApprovals = async ({
  from,
  to,
  lang,
  templateName,
  caName,
  link,
}: SendEmailParams & { link: string }) => {
  const language = languages[lang]();
  const templatePath = path.join(__dirname, 'templates', lang, 'pending_approvals.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { subject } = language.pendingAprovals;
  const message = templateContent
    .replace('##CREADNAME##', templateName)
    .replace('##CANAME##', caName)
    .replace('##CLICK_URL##', link);

  return sendMail(from, to, subject, message);
};

export const sendEmailNotifyRevoke = async ({
  from,
  to,
  lang,
  templateName,
  caName,
  userName,
}: SendEmailParams & { userName: string }) => {
  const language = languages[lang]({ template: templateName, ca: caName });
  const templatePath = path.join(__dirname, 'templates', lang, 'revoke_user.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { subject } = language.credentialRevoke;
  const message = templateContent
    .replace('##CREADNAME##', templateName)
    .replace('##CANAME##', caName)
    .replace('##NAME##', userName);

  return sendMail(from, to, subject, message);
};

export const sendDemoInviteEmail = async ({
  from,
  to,
  lang,
  name,
  templateName,
  caName,
  link,
}: SendEmailParams & { link: string }) => {
  const language = languages[lang]();
  const templatePath = path.join(__dirname, 'templates', lang, 'demo_invite.html');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const { subject } = language.demoInvite;
  const message = templateContent
    .replace('##NAME##', name)
    .replace('##CREADNAME##', templateName)
    .replace('##CANAME##', caName)
    .replace('##CLICK_URL##', link)
    .replace('##_TITLE_##', language.demoInvite.title);

  return sendMail(from, to, subject, message);
};
