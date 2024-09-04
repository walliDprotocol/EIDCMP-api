import express from 'express';

import { initializeWallet } from 'src/lib/waltid';
import middlewareFactory from './app-middleware/middlewareFactory';

import config from './config';

const { PORT } = config;

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('app');

const app = express();

async function startServer() {
  await initializeWallet(app);

  app.use(middlewareFactory(config));

  app.listen(PORT, () => {
    logDebug(`Server is running on port ${PORT}`);
  });
}

startServer();
