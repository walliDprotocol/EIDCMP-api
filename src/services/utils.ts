/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */
import { parse } from 'csv-parse';
import { validateParseFile } from 'src/services/admin';
import xlsx from 'xlsx';
import { uploadFile } from './ftp';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:utils');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const CSV_SPLIT_CHAR = ';';
const DataTypeSample = '<10-10-2020>';

export const randomCode = async function (length: number, chars: string) {
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
const getHeadersForTables = async function (templateItem: any) {
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
const generateExcelHeadersAndSample = async function (templateItens: any) {
  let colHeaders: Array<{ id: string; title: string; sample: string }> = [];
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

export const genExcelTemplate = async function (template_id:string, templateItens: any, format = 'xlsx') {
  logDebug('INPUT: template id ', template_id, ' templateItens ', templateItens, ' format ', format);

  const parsedItens = await generateExcelHeadersAndSample(templateItens);
  parsedItens.unshift({
    id: '9995',
    title: 'email',
    sample: 'john_doe@sample.io',
  });
  logDebug('parsedItens ', parsedItens);

  const folder = './uploads/templates';
  fs.mkdirSync(path.join(__dirname, folder), { recursive: true });

  let filePath;

  if (format === 'csv') { // Handle CSV format
    //
    filePath = path.join(__dirname, `/uploads/templates/template_${template_id}.csv`);
    logDebug('FilePath for CSV: ', filePath);

    const csvWriter = createCsvWriter({
      path: filePath,
      header: parsedItens,
      fieldDelimiter: CSV_SPLIT_CHAR,
    });

    await csvWriter.writeRecords([{ ...Object.fromEntries(parsedItens.map((h) => [h.id, h.sample])) }]);

    logDebug('The CSV file was written successfully');
  } else if (format === 'xlsx') { // Handle XLSX format
    //
    filePath = path.join(__dirname, `/uploads/templates/template_${template_id}.xlsx`);
    logDebug('FilePath for XLSX: ', filePath);

    const data = [parsedItens.map((h) => h.title), parsedItens.map((h) => h.sample)];

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, filePath);

    logDebug('The XLSX file was written successfully');
  } else {
    throw new Error('Invalid format. Supported formats are csv and xlsx.');
  }

  // Read the file to get its buffer
  const fileBuffer = fs.readFileSync(filePath);

  // Upload the file
  const { url: fileUrl } = await uploadFile(`template_${template_id}.${format}`, { buffer: Buffer.from(fileBuffer) });

  logDebug('Location of the file: ', fileUrl);

  // Optionally delete the file locally after upload
  // fs.unlinkSync(filePath);

  return filePath;
};

// email;PLACEHOLDER
const findHeadersDelimiter = async function (filePath: string) {
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
const parseDataFromCSV = async function (filePath: string): Promise<string[][]> {
  logDebug('filePath ', filePath);
  const delimiterChar = await findHeadersDelimiter(filePath);
  logDebug('delimiterChar', delimiterChar);

  const csvData: string[][] = [];
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: delimiterChar }))
      .on('data', (csvrow: string[]) => {
        csvData.push(csvrow);
      })
      .on('end', () => {
        resolve(csvData);
      });
  });
};

const parseDataFromXLSX = async function (filePath: string): Promise<string[][]> {
  logDebug('filePath ', filePath);

  return new Promise((resolve, reject) => {
    try {
      // Read the workbook
      const workbook = xlsx.readFile(filePath);

      // Get the first sheet name
      const firstSheetName = workbook.SheetNames[0];
      logDebug('First sheet name: ', firstSheetName);

      // Get the first sheet
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert the sheet to JSON
      let jsonData: string[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false }); // `header: 1` means we want an array of arrays
      jsonData = jsonData.filter((row: any[]) => !row.every((cell) => cell === undefined || cell === null || cell === '')); logDebug('Parsed XLSX Data: ', jsonData);
      resolve(jsonData); // Resolve with the parsed data
    } catch (error) {
      logDebug('Error parsing XLSX file: ', error);
      reject(new Error('Failed to parse XLSX file'));
    }
  });
};

// check if there are more then one header, if true its for adding a table!
const checkIfContainTable = function (header: string[]) {
  const jsonHeader: Record<string, number> = {};
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
  const tableKeys: Record<string, number> = {};
  for (const key in jsonHeader) {
    if (jsonHeader[key] > 1) {
      tableKeys[key] = jsonHeader[key];
    }
  }

  return { containTable, headerMap: jsonHeader, tableColumnsNum: Object.keys(tableKeys).length };
};

// const parseExcelWithTable = function (rows: string[], headerMaps: Record<string, number>, numberOfColumns: number) {
//   const finalArray: any[] = [];
//   let header: string[] = [];
//   let i = 0;

//   logDebug('Number of columns #', numberOfColumns);
//   rows.forEach((elem) => {
//     if (i === 0) {
//       header = elem;
//     } else {
//       let fieldIndex = 0;
//       const o = { email: '', userData: {}, table_values: [] } as any;
//       let tableInnerLine = 0;
//       let tableRow: any = {};
//       elem.forEach((val) => {
//         if (header[fieldIndex].toLowerCase().includes('email') || header[fieldIndex].includes('Email') || header[fieldIndex].includes('e-mail')) {
//           o.email = val;
//         } else {
//           const nTableColumn = headerMaps[header[fieldIndex].toLowerCase()];
//           // if headerMaps with fieldVal > 1 is because its a table otherwise its a keyval
//           if (nTableColumn !== 1) {
//             tableRow[header[fieldIndex].toLowerCase()] = val;
//             tableInnerLine += 1;

//             // Assuming there is only one table in excel data
//             // Assuming that all column of the same line are one after another
//             // when the counter tableinnerline is the same of table columns will be added as table line
//             if (tableInnerLine >= numberOfColumns) {
//               o.table_values.push(tableRow);
//               tableRow = {};
//               tableInnerLine = 0;
//             }

//             // if its 1 its a keyValue
//           } else {
//             o.userData[header[fieldIndex].toLowerCase()] = val;
//           }
//         }
//         fieldIndex += 1;
//       });
//       // just add empty or filled
//       finalArray.push(o);
//     }
//     i += 1;
//   });
//   return finalArray;
// };

// -> Import Excel Data to MySQL database
export const importExcelData = async function (filePath: string, tid: number, fileFormat: string) {
  const finalArray:any[] = [];
  let header: string[] = [];
  let i = 0;
  try {
    let rows: string[][] = [];

    switch (fileFormat) {
      case 'csv':
        rows = await parseDataFromCSV(filePath);
        break;
      case 'xlsx':
        rows = await parseDataFromXLSX(filePath);
        break;
      default:
        break;
    }

    logDebug('***  Parse excel data **** ', rows);

    const haveTable = checkIfContainTable(rows[0]);
    // logDebug('Have table ', haveTable)
    if (haveTable.containTable) {
      logDebug('Not implemented yet!');
      // finalArray = parseExcelWithTable(rows, haveTable.headerMap, haveTable.tableColumnsNum);
    } else {
      rows.forEach((elem) => {
        if (i === 0) {
          header = elem;
        } else {
          let valIdx = 0;
          const o: any = { email: '', userData: {} };
          elem.forEach((val) => {
            if (header[valIdx].includes('email')) {
              o.email = val;
            } else {
              o.userData[header[valIdx]] = val;
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
