import express, { Request, Response } from 'express';

const { getDashboard } = require('src/services/dashboard');
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:dashboard');

const router = express.Router();

const PARAMETERS = ['wa'];

router.post('/', async (request: Request, response: Response) => {
  try {
    response.status(200).json({
      message: 'toma ze',
    });
  } catch (error: any) {
    logError('router:create CA ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.get('/', async (request: Request, response: Response) => {
  logDebug('query string ', request.query);
  const { wa } = validator(request.query, PARAMETERS);

  try {
    const result = await getDashboard(wa);
    response.status(200).json({
      message: '',
      data: result,
    });
  } catch (error:any) {
    logError('router:create CA ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

export default router;
