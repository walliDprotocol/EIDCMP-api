/* eslint-disable global-require, import/no-dynamic-require */
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('mongo');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const mongoModels: Record<string, unknown> = {};

function loadModels() {
  const pathSchemas = path.resolve('./src/database/mongo/schemas/');

  fs.readdirSync(pathSchemas).forEach(async (file: string) => {
    const extension = file.slice(file.length - 3, file.length);
    if (file === 'index.ts' || !['.js', '.ts'].includes(extension)) return;
    try {
      const schema = file.slice(0, file.length - 3);

      // prettier-ignore
      const schemaFile = extension === '.ts'
        ? (await require(`./schemas/${file}`)).schema || (await require(`./schemas/${file}`)).default
        : await require(`./schemas/${file}`);

      mongoModels[schema] = mongoose.model(schema, schemaFile);
      // eslint-disable-next-line no-console
    } catch (err) {
      logError('Error loading schema ', file, ' ', err);
    }
  });
}

export = (url: string) => {
  try {
    mongoose.connect(url, {
      // useFindAndModify: false,
      // useCreateIndex: false,
      connectTimeoutMS: 10000,
      retryWrites: false,
    });

    mongoose.connection.on('connected', () => logDebug('Connection to database established'));
    loadModels();
    return mongoModels;
  } catch (error) {
    logDebug('[DATABASE] ', error);
    return {};
  }
};
