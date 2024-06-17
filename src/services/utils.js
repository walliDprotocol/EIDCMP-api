/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */

const { validateParseFile } = require('src/services/admin');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:utils');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');

const CVS_SPLIT_CHAR = ';';
const DataTypeSample = '<10-10-2020>';

const randomCode = async function (length, chars) {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; i -= 1) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};

// add columns for table adding sample for each column
const getHeadersForTables = async function (templateItem) {
  const colHeaders = [];
  const REPEAT_NUMBER = 22;

  for (let i = 0; i < REPEAT_NUMBER; i += 1) {
    for (let j = 0; j < templateItem.table_attr.length; j += 1) {
      const tableCols = templateItem.table_attr[j];
      // logDebug('table col ', tableCols);
      let sample;
      switch (tableCols.type) {
        case 'date':
          sample = DataTypeSample;
          break;
        case 'text':
          sample = '<Sample>';
          break;
        default:
          sample = '<99>';
      }

      colHeaders.push({
        id: await randomCode(4, '###'),
        title: tableCols.attr,
        sample,
      });
    }
  }

  // logDebug('final table headers ', colHeaders);
  return colHeaders;
};

/**
  * add template columns and sample line
  * @param {Object[]} templateItens
  */
const generateExcelHeadersAndSample = async function (templateItens) {
  let colHeaders = [];
  for (let i = 0; i < templateItens.length; i += 1) {
    const line = templateItens[i];
    logDebug(' item table  ', line);
    if (line.attrFormat === 'table') {
      colHeaders = colHeaders.concat(await getHeadersForTables(line));
    } else {
      let sample;
      switch (line.type) {
        case 'date':
          sample = DataTypeSample;
          break;
        case 'text':
          sample = '<Sample>';
          break;
        default:
          sample = '<99>';
      }
      colHeaders.push({
        id: await randomCode(4, '###'),
        title: line.attr,
        sample,
      });
    }
  }

  return colHeaders;
};

const genExcelTemplate = async function (template_id, templateItens) {
  logDebug('INPUT :  template id ', template_id, ' templateItens ', templateItens);

  const parsedItens = await generateExcelHeadersAndSample(templateItens);
  const headers = [];
  const sampleItem = {};

  //! force  first column always be an email  !!
  headers.push({ id: '9995', title: 'email' });
  sampleItem['9995'] = 'john_doe@sample.io';

  for (let i = 0; i < parsedItens.length; i += 1) {
    headers.push({ title: parsedItens[i].title, id: parsedItens[i].id });
    // logDebug('Sample item value id : ', parsedItens[i].id );
    sampleItem[parsedItens[i].id] = parsedItens[i].sample;
  }

  logDebug('Excel Headers ', headers);
  logDebug('Excel Samples Lines ', sampleItem);
  const folder = './uploads/excelTemplates';

  fs.mkdirSync(path.join(__dirname, folder), { recursive: true });

  const filePath = path.join(__dirname, `/uploads/excelTemplates/importa-data-${template_id}.csv`);
  logDebug('filePath ', filePath);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: headers,
    fieldDelimiter: CVS_SPLIT_CHAR,
  });

  await csvWriter
    .writeRecords([sampleItem])
    .then(() => logDebug('The CSV file was written successfully'));

  const excelUrl = `excelTemplates/template_${template_id}.csv`;

  logDebug('Location of excel file ', excelUrl);

  // delete file locally!!
  // fs.unlinkSync(filePath);

  return excelUrl;
};

// email;PLACEHOLDER
const findHeadersDelimiter = async function (filePath) {
  // read contents of the file
  const data = fs.readFileSync(filePath, 'utf-8');

  // split the contents by new line
  const lines = data.split(/\r?\n/);

  if (lines.length > 0) {
    const firstLine = lines[0];
    if ((firstLine.match(/;/g) || []).length > 0) {
      return ';';
    } if ((firstLine.match(/,/g) || []).length > 0) {
      return ',';
    }

    throw new Error(`CSV should be delimited by ';' or ',' ${firstLine}`);
  } else {
    throw new Error('File containing data are empty ');
  }
};

// for a given csv file parse all the information of rows!! Row[0] always be Headers
const parseDataFromCVS = async function (filePath) {
  const delimiterChar = await findHeadersDelimiter(filePath);
  logDebug('Delimitador char ', delimiterChar);

  const csvData = [];
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: delimiterChar }))
      .on('data', (csvrow) => {
        csvData.push(csvrow);
      })
      .on('end', () => {
        resolve(csvData);
      });
  });
};

// check if there are more then one header, if true its for adding a table!
const checkIfContainTable = function (header) {
  const jsonHeader = {};
  let containTable = false;
  header.forEach((key) => {
    const keyLowerCase = key.toLowerCase();
    if (typeof jsonHeader[keyLowerCase] === 'undefined') {
      jsonHeader[keyLowerCase] = 1;
    } else {
      containTable = true;
      jsonHeader[keyLowerCase] += 1;
    }
  });
  // counting the number of keys more then 1, column of the table
  // logDebug('Json header ', jsonHeader);
  const tableKeys = [];
  for (const key in jsonHeader) {
    if (jsonHeader[key] > 1) {
      tableKeys[key] = jsonHeader[key];
    }
  }

  return { containTable, headerMap: jsonHeader, tableColumnsNum: Object.keys(tableKeys).length };
};

const parseExcelWithTable = function (rows, headerMaps, numberOfColumns) {
  const finalArray = [];
  let header = [];
  let i = 0;

  logDebug('Number of columns #', numberOfColumns);
  rows.forEach((elem) => {
    if (i === 0) {
      header = elem;
    } else {
      let fieldIndex = 0;
      const o = { email: '', user_data: {}, table_values: [] };
      let tableInnerLine = 0;
      let tableRow = {};
      elem.forEach((val) => {
        if (header[fieldIndex].toLowerCase().includes('email') || header[fieldIndex].includes('Email') || header[fieldIndex].includes('e-mail')) {
          o.email = val;
        } else {
          const nTableColumn = headerMaps[header[fieldIndex].toLowerCase()];
          // if headerMaps with fieldVal > 1 is because its a table otherwise its a keyval
          if (nTableColumn !== 1) {
            tableRow[header[fieldIndex].toLowerCase()] = val;
            tableInnerLine += 1;

            // Assuming there is only one table in excel data
            // Assuming that all column of the same line are one after another
            // when the counter tableinnerline is the same of table columns will be added as table line
            if (tableInnerLine >= numberOfColumns) {
              o.table_values.push(tableRow);
              tableRow = {};
              tableInnerLine = 0;
            }

            // if its 1 its a keyValue
          } else {
            o.user_data[header[fieldIndex].toLowerCase()] = val;
          }
        }
        fieldIndex += 1;
      });
      // just add empty or filled
      finalArray.push(o);
    }
    i += 1;
  });
  return finalArray;
};

// -> Import Excel Data to MySQL database
const importExcelData = async function (filePath, tid) {
  let finalArray = [];
  let header = [];
  let i = 0;
  try {
    const rows = await parseDataFromCVS(filePath);
    logDebug('***  Parse excel data **** ', rows);

    const haveTable = checkIfContainTable(rows[0]);
    // logDebug('Have table ', haveTable)
    if (haveTable.containTable) {
      finalArray = parseExcelWithTable(rows, haveTable.headerMap, haveTable.tableColumnsNum);
    } else {
      rows.forEach((elem) => {
        if (i === 0) {
          header = elem;
        } else {
          let valIdx = 0;
          const o = { email: '', user_data: {} };
          elem.forEach((val) => {
            if (header[valIdx].includes('email')) {
              o.email = val;
            } else {
              o.user_data[header[valIdx]] = val;
            }
            valIdx += 1;
          });
          finalArray.push(o);
        }
        i += 1;
      });
    }

    const infoParsed = await validateParseFile(finalArray, tid);
    logDebug('Parsed :  ', infoParsed);
    // await validateParseFile(finalArray, tid);

    //  logDebug('Final Result ' ,finalArray );
    return finalArray;
  } catch (ex) {
    logError('error parsing file ', ex);
    throw ex;
  } finally {
    logError('Delete import file ', filePath);
    // delete file locally!!
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  randomCode, importExcelData, genExcelTemplate,
};
