const { DataBaseSchemas } = require('src/types/enums');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:user');

const { DB } = require('src/database');
const { listTemplateItens } = require('src/services/templateItem');

const { sendEmailInviteUser } = require('src/services/mailer');
const { createCredentialOfferUrl } = require('./credential');

const verifyByType = (inputType, value) => {
  if (inputType === 'date') {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  } if (['text', 'string', 'image'].includes(inputType)) { // FIXME: remove 'text' in the future, 'image' should be 'url'?
    return true;
  } if (inputType === 'number') {
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
      // tItem.attr/key name | tItem.inputType=inputType
      const lineVal = tableLine[tItem.attr.toLowerCase()];
      // if lineVale isnt null means that template item attr[the key] is present in table line object. So isnt null

      if (lineVal) {
        // check the inputType and continues
        if (!verifyByType(tItem.inputType.toLowerCase(), lineVal)) {
          logDebug('Type and Value dont match in table field attr: ', tItem.attr, ' tItem inputType ', tItem.inputType, ' val ', lineVal, ' table line ', tableLine);
          throw new Error(`Type and Value don't match in table field attr: ${tItem.attr}, tItem inputType: ${tItem.inputType}, val: ${lineVal}, table line: ${tableLine}`);
        }
      } else {
        logDebug('#5353 !!!WARNING!!!! Table Field  ', tItem.attr, ' isnt present at this line table ', tableLine, ' if that field is mandatory your fuckup');
      }
    });
  }));
  // if there are no mandatory missing or and fault by inputType its ok tu use table data

  // copy headers to userData too
  return { headers: templateItem.table_headers, values: tableInput.values };
};

const checkTemplateItensAndDataType = async (templateItens, data) => {
  const returnData = {
    userData: {},
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
      if (!tempElem) {
        throw new Error(`No template item for id-${elem.temp_item_id}`);
      }

      if (tempElem.attrFormat === 'table') {
        returnData.userData.tables = await parseTableData(tempElem, elem);
      } else if (tempElem.attrFormat === 'keyval') {
        // logDebug('element on item ', temp_elem );
        // checking data inputType
        if ((tempElem.isMandatory === 'true' || elem.isPublic === true) && !elem.value) {
          throw new Error(`This field must be present attr : ${tempElem.attr.toString()} value : ${elem.value.toString()} mandatory ${tempElem.isMandatory}`);
        }

        if (elem.value) {
          if (verifyByType(tempElem.inputType, elem.value)) {
            if (elem.isPublic && (elem.isPublic === 'true' || elem.isPublic === true)) {
              returnData.public_field = {
                attr: tempElem.attr.toString(),
                value: elem.value.toString(),
              };
            }
            returnData.userData[tempElem.attr.toString()] = elem.value.toString();
          } else {
            logError('Type and Value dont match listItem id: ', elem.temp_item_id);
            throw new Error(`Type and value dont match inputType :${tempElem.inputType} value : ${elem.value}`);
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

const createNewUser = async (input) => {
  logDebug(' ********* Store New User ***********');
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

    // verify if all fields match with templates itens, lenght, inputType etc
    const templateItens = await listTemplateItens(input.tid);
    // logDebug('Data input  ', input.data);
    const returnData = await checkTemplateItensAndDataType(templateItens, input.data);

    // create user in user table
    const createUser = {
      tid: input.tid.trim(),
      cid: input.cid.trim(),
      email: input.email,
      imgArray: input.imgArray,
      public_field: returnData.public_field,
      userData: returnData.userData,
      status: 'waiting_wallet',
    };
    const newUser = await DB.create(DataBaseSchemas.USER, createUser);

    logDebug('Will Create pending invite  ', newUser);

    return {
      newUser: newUser.toJSON(),
      credencialIssuerDetails: {
        templateName: template.name,
        caName: ca.name,
        lang: template.lang,
      },
    };
  } catch (ex) {
    logError('Error creating new user ', ex);
    throw ex;
  }
};
async function createNewUserWrapper({
  cid,
  tid,
  data,
  email,
  imgArray,
  waAdmin,
  credentialConfigurationId = 'NaturalPersonVerifiableID',
}) {
  const { newUser, credencialIssuerDetails } = await createNewUser({
    cid,
    tid,
    data,
    email,
    imgArray,
  });

  logDebug('result', newUser);

  const caIssuerKey = await DB.findOne(DataBaseSchemas.CA, { _id: cid }, 'issuerKey issuerDid', null);

  logDebug('caDID', caIssuerKey);

  const body = {
    issuerKey: caIssuerKey.issuerKey,
    issuerDid: caIssuerKey.issuerDid,
    credentialConfigurationId: `${credentialConfigurationId}_jwt_vc_json`,
    credentialData: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
      ],
      id: newUser.id,
      type: ['VerifiableCredential', credentialConfigurationId],
      issuanceDate: new Date().toISOString(),
      credentialSubject: newUser,
    },
  };

  logDebug('body', body);

  const response = await createCredentialOfferUrl(body);

  const { credentialUrl } = response;
  logDebug('credentialUrl', credentialUrl);

  // Invite the user via email

  const resultInvite = await sendEmailInviteUser(newUser, { ...credencialIssuerDetails, waAdmin });

  logDebug('result', resultInvite);
  return { newUser, credentialUrl, resultInvite };
}

//* * create invite for user! */
const getUserById = async (input) => {
  try {
    logDebug('********** GetUserById 2 *********** ', input.userId);

    const user = await DB.findOne(DataBaseSchemas.USER, { _id: input.userId }, null, null);

    logDebug('Users: ', user);
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
        img_url: ca.imgUrl,
        frontendProps: template.frontendProps,
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
    logDebug('********** Get User By Invite  ***********', input);

    const invite = await DB.findOne(DataBaseSchemas.PENDING_INVITES, { _id: input.inviteId });
    if (!invite) {
      throw new Error(`There is no invite for this iD ${input.inviteId}`);
    }

    const user = await DB.findOne(DataBaseSchemas.USER, { _id: invite.data.userId }, '', null);
    logDebug('Users :  ', user);
    if (!user) {
      throw new Error('There is no user for these invite ID');
    }
    // load CA and Template
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: user.tid }, null, null);
    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: user.cid }, null, null);
    return {
      data: {
        ...user.toObject(),
        ca_name: ca.name,
        template_name: template.name,
        img_url: ca.imgUrl,
        frontendProps: template.frontendProps,
        template_itens: await listTemplateItens(invite.data.tid),
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
  getUserByInvite, getUserById, updateUser, createNewUser, createNewUserWrapper,
};
