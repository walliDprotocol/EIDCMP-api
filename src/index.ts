import express from 'express';

import { initializeWallet } from 'src/lib/waltid';
import middlewareFactory from './app-middleware/middlewareFactory';

import config from './config';

const { PORT } = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('app');

const app = express();

async function startServer() {
  try {
    await initializeWallet(app);
  } catch (error) {
    logError('Error initializing wallet', error);
  }

  app.use(middlewareFactory(config));

  app.listen(PORT, () => {
    logDebug(`Server is running on port ${PORT}`);
  });
}

startServer();
