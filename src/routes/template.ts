import express, { Request, Response } from 'express';

const { createTemplate, getTemplate, deleteTemplate } = require('src/services/template');
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:template');

const router = express.Router();

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

router.delete('/', async (request: Request, response: Response) => {
  logDebug('  ** delete template **  ', request.query);

  try {
    let tids = request.query.tid as string[] | string;

    if (typeof tids === 'string') {
      tids = [tids] as string[];
    }

    const results = await Promise.all(
      tids?.map(async (tid: string) => {
        try {
          await deleteTemplate({ tid });
          return { tid, success: true };
        } catch (error) {
          logError('router:create template ', error);
          return { tid, success: false };
        }
      }),
    );

    response.status(200).json(
      {
        data: null,
        message: `Template deleted successfully: ${results.filter((result: any) => result.success).map((result: any) => result.tid)}`,
        failed: results.filter((result: any) => !result.success).map((result: any) => result.tid),
      },
    );
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

export default router;
