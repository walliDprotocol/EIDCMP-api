const { uploadFile } = require('src/services/ftp');

const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:user');

const { DB } = require('src/database');
const config = require('src/config').default;
const { listTemplateItens } = require('src/services/templateItem');
const QRCode = require('qrcode');

const { sendEmailInviteUser } = require('src/services/mailer');

const verifyByType = (type, value) => {
  if (type === 'date') {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  } if (type === 'text' || type === 'image') {
    return true;
  } if (type === 'number') {
    const reg = /^\d+$/;
    return reg.test(value);
  }
  return false;
};

const parseTableData = async (templateItem, tableInput) => {
  // logDebug('template item ', templateItem, ' table input ', tableInput);
  await Promise.all(tableInput.values.map(async (tableLine) => {
    // loop over template item [table_attr] check columns and types
    templateItem.table_attr.forEach((tItem) => {
      // tItem.attr/key name | tItem.type=type
      const lineVal = tableLine[tItem.attr.toLowerCase()];
      // if lineVale isnt null means that template item attr[the key] is present in table line object. So isnt null

      if (lineVal) {
        // check the type and continues
        if (!verifyByType(tItem.type.toLowerCase(), lineVal)) {
          logDebug('Type and Value dont match in table field attr: ', tItem.attr, ' tItem type ', tItem.type, ' val ', lineVal, ' table line ', tableLine);
          throw new Error(`Type and Value don't match in table field attr: ${tItem.attr}, tItem type: ${tItem.type}, val: ${lineVal}, table line: ${tableLine}`);
        }
      } else {
        logDebug('#5353 !!!WARNING!!!! Table Field  ', tItem.attr, ' isnt present at this line table ', tableLine, ' if that field is mandatory your fuckup');
      }
    });
  }));
  // if there are no mandatory missing or and fault by type its ok tu use table data

  // copy headers to user_data too
  return { headers: templateItem.table_headers, values: tableInput.values };
};

const checkTemplateItensAndDataType = async (templateItens, data) => {
  const returnData = {
    user_data: {},
    public_field: '',
  };
  try {
    logDebug('Template itens ', templateItens);

    // logDebug('templateItens ', templateItens);
    await Promise.all(data.map(async (elem) => {
      // logDebug('1.1 Template Itens ', templateItens );
      // logDebug('1.2 Data ITEM ', elem );

      // logDebug('element on data ', elem );
      // getting the template item!!
      const tempElem = templateItens.find((o) => o._id.toString() === elem.temp_item_id.toString());

      // logDebug('Template element ', temp_elem);

      if (tempElem.attrFormat === 'table') {
        returnData.user_data.tables = await parseTableData(tempElem, elem);
      } else if (tempElem.attrFormat === 'keyval') {
        // logDebug('element on item ', temp_elem );
        if (!tempElem) {
          throw new Error(`No template item for id-${elem.temp_item_id}`);
        }
        // checking data type
        if ((tempElem.isMandatory === 'true' || elem.isPublic === true) && !elem.value) {
          throw new Error(`This field must be present attr : ${tempElem.attr.toString()} value : ${elem.value.toString()} mandatory ${tempElem.isMandatory}`);
        }

        if (elem.value) {
          if (verifyByType(tempElem.type, elem.value)) {
            if (elem.isPublic && (elem.isPublic === 'true' || elem.isPublic === true)) {
              returnData.public_field = {
                attr: tempElem.attr.toString(),
                value: elem.value.toString(),
              };
            }
            returnData.user_data[tempElem.attr.toString()] = elem.value.toString();
          } else {
            logError('Type and Value dont match listItem id: ', elem.temp_item_id);
            throw new Error(`Type and value dont match type :${tempElem.type} value : ${elem.value}`);
          }
        }
      }
    }));

    return returnData;
  } catch (ex) {
    logError('Error checking template and template fiedls ', ex);
    throw ex;
  }
};
//* * create invvite for user! */
const inviteNewUser = async (input) => {
  logDebug(' ********* Store New User ***********');

  const from = config.EMAIL_SENDER || 'WalliD - Credentials <credentials@wallid.io>';
  let clickableLink = config.USER_INVITE;

  try {
    // load CA and Template
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: input.tid }, null, null);
    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: input.cid }, null, null);

    if (!template) {
      throw new Error(`There is no template with ID:${input.tid}`);
    }
    if (!ca) {
      throw new Error(`There is no CA with ID:${input.cid}`);
    }

    // verify if all fields match with templates itens, lenght, type etc
    const templateItens = await listTemplateItens(input.tid);
    // logDebug('Data input  ', input.data);
    const returnData = await checkTemplateItensAndDataType(templateItens, input.data);

    // create a userInfractions object and using the infractions data
    const userInfractions = await DB.create(DataBaseSchemas.USER_INFRACTIONS, {
      infractions: [],
    });

    // create user in user table
    const createUser = {
      tid: input.tid.trim(),
      cid: input.cid.trim(),
      email: input.email,
      categories: input.categories,
      public_field: returnData.public_field,
      user_data: returnData.user_data,
      status: 'waiting_wallet',
      userInfractionsId: userInfractions._id.toString(),
    };
    const newUSer = await DB.create(DataBaseSchemas.USER, createUser);

    logDebug('Will Create pending invite  ', newUSer);

    // store the hash's for pivate fields
    // store public fields in user data
    const inviteData = {
      user_id: newUSer._id.toString(),
      tid: input.tid.trim(),
      cid: input.cid.trim(),
      ca_photo: ca.img_url,
      wa_admin: input.waAdmin.trim(),
    };
    // save invite in table:
    const inviteId = await DB.create(DataBaseSchemas.PENDING_INVITES, {
      from, to: input.email, type: 'invite_user', data: inviteData,
    });
    logDebug('InviteId', inviteId);

    clickableLink += inviteId._id;

    // base64 images don't work, using gridfs to store images
    const qrCodeBuffer = await QRCode.toBuffer(`${inviteId._id}`, { type: 'png' });

    const { url: qrCode } = await uploadFile(`qrCode_${inviteId._id}`, { buffer: new Uint8Array(qrCodeBuffer) });
    logDebug('qrCode url', qrCode);

    logDebug('Invite Data ', inviteData);
    logDebug('Link', clickableLink);
    logDebug('template', template);
    logDebug('ca', ca);

    const sendEmailAsync = async () => {
      logDebug('*** sendEmail user in setTimeout *** ');
      // send email to user for onboarding
      const emailNameKey = Object.keys(createUser.user_data).find((key) => ['nome', 'name', 'nombre'].includes(key.toLowerCase())) || '';

      await sendEmailInviteUser(from, input.email, {
        link: clickableLink,
        template: template.name,
        ca: ca.name,
        name: createUser.user_data[emailNameKey],
        lang: template.lang,
        qrCode,
      });
    };
    setTimeout(sendEmailAsync, (Math.floor(Math.random() * 6) + 2) * 1000);

    return {
      data: {
        mgs: 'invite was send',
        inviteId: inviteId._id,
      },
    };
  } catch (ex) {
    logError('Error Issuing user credentials ', ex);
    throw ex;
  }
};

const getUserById = async (input) => {
  try {
    logDebug('********** GetUserById 2 *********** ', input.user_id);

    const user = await DB.findOne(DataBaseSchemas.USER, { _id: input.user_id }, null, null);

    logDebug('USers :  ', user);
    if (!user) {
      throw new Error('There is no user for these invite ID');
    }

    // load CA and Template
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: user.tid }, null, null);
    logDebug('Template :  ', template);

    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: user.cid }, null, null);
    logDebug('CA :  ', ca);

    const userInfractions = await DB.findOne(DataBaseSchemas.USER_INFRACTIONS, { _id: user.userInfractionsId }, null, null);
    logDebug('User Infractions :  ', userInfractions);

    if (!template) {
      throw new Error(`There is no template with ID:${user.tid}`);
    }
    if (!ca) {
      throw new Error(`There is no CA with ID:${user.cid}`);
    }

    return {
      data: {
        ...user.toObject(),
        ca_name: ca.name,
        template_name: template.name,
        img_url: ca.img_url,
        frontend_props: template.frontend_props,
        template_itens: await listTemplateItens(user.tid),
        userInfractions,

      },
    };
  } catch (ex) {
    logError('Error getUserById ', ex);
    throw ex;
  }
};

const getUserByInvite = async (input) => {
  try {
    logDebug('********** Get User By Invite  ***********');

    const invite = await DB.findOne(DataBaseSchemas.PENDING_INVITES, { _id: input.inviteId }, '', null);
    if (!invite) {
      throw new Error(`There is no invite for this iD${input.inviteId}`);
    }

    if (!invite.data && invite.data.user_id && invite.data.tid) {
      throw new Error('This is not a user invite');
    }

    const user = await DB.findOne(DataBaseSchemas.USER, { _id: invite.data.user_id }, '', null);
    if (!user) {
      throw new Error('There is no user for these invite ID');
    }
    // load CA and Template
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: user.tid }, null, null);
    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: user.cid }, null, null);
    const userInfractions = await DB.findOne(DataBaseSchemas.USER_INFRACTIONS, { _id: user.userInfractionsId }, null, null);
    logDebug('User Infractions :  ', userInfractions);
    return {
      data: {
        ...user.toObject(),
        ca_name: ca.name,
        template_name: template.name,
        img_url: ca.img_url,
        frontend_props: template.frontend_props,
        template_itens: await listTemplateItens(invite.data.tid),
        userInfractions,
      },
    };
  } catch (ex) {
    logError('Error getting user by Invite');
    throw ex;
  }
};

const updateUser = async (userId, data) => {
  try {
    logDebug('********** Update User  ***********');

    const user = await DB.findOne(DataBaseSchemas.USER, { _id: userId }, '', null);
    if (!user) {
      throw new Error(`There is no user for this iD ${userId}`);
    }

    const updatedUser = await DB.findOneAndUpdate(DataBaseSchemas.USER, { _id: userId }, data, { returnDocument: 'after' });
    return {
      data: updatedUser,
    };
  } catch (ex) {
    logError('Error updating user');
    throw ex;
  }
};

module.exports = {
  inviteNewUser, getUserByInvite, getUserById, updateUser,
};
