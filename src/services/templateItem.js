import { DB } from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:templateIem');

const { genExcelTemplate } = require('src/services/utils');

const storeTable = async (input) => {
  logDebug(' ********* Store New Template table ***********  ', input);

  try {
    if (!input.table_headers) {
      throw new Error('No headers table');
    }
    if (!input.table_attr) {
      throw new Error('No inputType attrs in table');
    }

    const resp = await DB.insertMany(DataBaseSchemas.TEMPLATE_ITEM, input, { returnNewDocument: true });

    return resp;
  } catch (ex) {
    logError('[Error] create template item table in db', ex);
    throw ex;
  }
};

/**
 * save a single template item
 * @param {Object[]} input
 */
const createItemTemplate = async (input) => {
  logDebug(' ********* Store New Template Item ***********  ', input);

  try {
    if (input.length === 0) {
      throw new Error('No template attributes are given');
    }

    const resp = await DB.insertMany(DataBaseSchemas.TEMPLATE_ITEM, input, { returnNewDocument: true });

    return resp;
  } catch (ex) {
    logError('[Error] create template item in db', ex);
    throw ex;
  }
};

/**
 * save a list of template itens
 * @param {*} data
 */
const createTemplateList = async (data) => {
  logDebug(' ********* Store new Template List *********** ', data);

  // let code =
  // console.log('code for template! ', code);

  try {
    if (!data.attrs.length > 0) {
      throw new Error('No template attributes are given');
    }

    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: data.cid }, null, null);
    // check if template is already have calculted hash
    const template = await DB.findOne(DataBaseSchemas.TEMPLATE, { _id: data.tid }, '', null);
    logDebug('Template ', template);

    if (!template && (template.hashSod == null || template.hashSod === '')) {
      throw new Error('These already have itens! Use a empty template');
    }

    if (!ca) {
      throw new Error(`There is no CA with ID:${data.cid}`);
    }

    // Iterate over keyvalues attributes
    const inputs = data.attrs.map((elem) => ({
      cid: data.cid,
      tid: data.tid,
      order: elem.order,
      isPublic: elem.isPublic,
      inputType: elem.inputType.trim(),
      attr: elem.attr.trim(),
      isMandatory: elem.isMandatory,
      attrFormat: 'keyval',
    }));

    const addedItens = await createItemTemplate(inputs);

    let addedTables = [];

    // table store
    if (data.tables && data.tables.length > 0) {
      logDebug('There are tables on there');
      addedTables = await Promise.all(
        data.tables.map(async (table) => {
          const input = {
            cid: data.cid,
            tid: data.tid,
            table_headers: table.headers,
            table_attr: table.attrs,
            isPublic: table.isPublic || 'true',
            isMandatory: table.isMandatory,
            attrFormat: 'table',
          };
          const itemCreated = await storeTable(input);
          if (!itemCreated.length > 0) {
            throw new Error(`Error creating template table ${table.table_headers.trim()}`);
          }
          return itemCreated[0];
        }),
      );
      addedItens.push(addedTables[0]);
    }

    // update template hash after added template itens

    // Fev 2021 - Add template excel
    // const templateUrl = await genExcelTemplate(data.tid, addedItens);
    // await DB.findOneAndUpdate(DataBaseSchemas.TEMPLATE, { _id: data.tid }, { excelTemplate: templateUrl }, { new: true });

    // console.log('template itens # ', addedItens);
    return {
      cid: data.cid,
      contract_address: ca.contract_address,
      template:
        {
          tid: data.tid,
        },
      templateItens: addedItens,
      // templateTable : addedTables
    };
  } catch (ex) {
    logError('Error create template ', ex);
    throw ex;
  }
};

const listTemplateItens = async (tid) => {
  // logDebug(' ********* list Templates Item ***********', tid);

  try {
    const criteria = { tid };
    let output = await DB.find(
      DataBaseSchemas.TEMPLATE_ITEM,
      criteria,
      'attr inputType isPublic _id attrFormat table_attr table_headers isMandatory sigs logos order',
      null,
    );
    if (!output || output.length === 0) {
      logError('There no template itens for this template');
      // throw 'There no template itens for this template';
      output = [];
    }

    return output;
  } catch (ex) {
    logError('Error listing CA');
    throw ex;
  }
};

export { createTemplateList, listTemplateItens };
