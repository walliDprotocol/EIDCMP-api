import { Request, Response } from 'express';

const express = require('express');
const { createTemplate, getTemplate } = require('src/services/template');
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:template');

const router = new express.Router();
const PARAMETERS = ['cid', 'name', 'wa', 'frontendProps', 'frontendProps.components', 'frontendProps.currentLayout', 'frontendProps.backgroundFront'];

router.post('/', async (request: Request, response: Response) => {
  logDebug('  ***  create template  ***  ');

  try {
    const lang = request.acceptsLanguages(['es', 'pt', 'pt-pt', 'en', 'en-US']) || 'pt';
    request.body.lang = lang.slice(0, 2);
    validator(request.body, PARAMETERS);
    const result = await createTemplate(request.body);

    response.status(200).json(result);
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

/**
 * List templates for certAuthority
 */
router.get('/', async (request: Request, response: Response) => {
  logDebug('  ** get template **  ');

  try {
    validator(request.query, ['tid']);
    const result = await getTemplate(request.query);

    response.status(200).json(result);
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

export default router;
