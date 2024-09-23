/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import { DataBase } from 'src/types/schemas';
import { DataBaseSchemas } from 'src/types/enums';

import config from 'src/config';

import connectToMongo from './mongo';

const {
  COMPLEMENT, DB_HOST, DB_NAME, DB_PASS, DB_USER,
} = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('database');

// create a string for the mongoDB URI from the environment variables
const databaseURL = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}${COMPLEMENT}`;

logDebug('MONGO URI CONNECTED : ', databaseURL);
const mongoDB: Record<string, any> = connectToMongo(databaseURL);

if (!mongoDB) {
  logError('[DATABASE] - Error connecting to MongoDB. Exiting...');
  process.exit(1);
}

const Database: DataBase = {
  // Generic methods

  create: (schema: DataBaseSchemas, data: any, options: any) => mongoDB[schema].create(data, options),
  find: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].find(filter, select, options),
  findOne: (schema: DataBaseSchemas, filter: any, select: any, options: any) => mongoDB[schema].findOne(filter, select, options),
  findOneAndUpdate: (schema: DataBaseSchemas, filter: any, update: any, options: any) => mongoDB[schema].findOneAndUpdate(filter, update, options),
  insertMany: (schema: DataBaseSchemas, data: any, options: any) => mongoDB[schema].insertMany(data, options),
  updateOne: (schema: DataBaseSchemas, filter: any, update: any, options: any) => mongoDB[schema].updateOne(filter, update, options),
  remove: (schema: DataBaseSchemas, filter: any, options: any) => mongoDB[schema].findOneAndDelete(filter, options),
  removeAll: (schema: DataBaseSchemas, filter: any, options: any) => mongoDB[schema].deleteMany(filter, options),
};

export default Database;
export { Database as DB };
