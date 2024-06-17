import express from 'express';

import middlewareFactory from './app-middleware/middlewareFactory';

import config from './config';

const { PORT } = config;

const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('app');

const app = express();
app.use(middlewareFactory(config));

app.listen(PORT, () => {
  logDebug(`Server is running on port ${PORT}`);
});
