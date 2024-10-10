import express from 'express';
import { createServer } from 'http';

import { initializeWallet } from 'src/lib/waltid';
import { initializeSocket } from 'src/app-middleware/socket';
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

  const httpServer = createServer(app);

  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    logDebug(`Server is running on port ${PORT}`);
  });
}

startServer();
