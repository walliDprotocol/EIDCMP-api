import express, { Request, Response } from 'express';
import { getTemplates } from 'src/services/template';
import { genExcelTemplate } from 'src/services/utils';

const { createTemplate, getTemplate, deleteTemplate } = require('src/services/template');
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:template');
const fs = require('fs');

const router = express.Router();

const PARAMETERS = ['cid', 'name', 'wa', 'frontendProps', 'frontendProps.components', 'frontendProps.currentLayout', 'frontendProps'];

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
    const { tid, cid } = request.query;
    if (tid) {
      const result = await getTemplate(request.query);

      response.status(200).json(result);
      return;
    }
    if (cid) {
      const result = await getTemplates(cid as string);
      response.status(200).json(result);
      return;
    }

    response.status(200).json({
      data: null,
      message: 'No templates found',
    });
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.delete('/delete', async (request: Request, response: Response) => {
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

router.get('/:tid/download/:fileFormat', async (request: Request, response: Response) => {
  try {
    logDebug('  ** get template file **  ', request.params, request.query);
    const { tid, fileFormat } = validator(request.params, ['tid', 'fileFormat']);
    const { templateItens } = await getTemplate({ tid });
    const templateFilePath = await genExcelTemplate(tid, templateItens, fileFormat);

    // Set correct headers for the response based on the file format
    const mimeType = fileFormat === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';

    // Set headers to indicate file attachment and correct content type
    response.setHeader('Content-Disposition', `attachment; filename=template_${tid}.${fileFormat}`);
    response.setHeader('Content-Type', mimeType);

    // Send the file
    response.sendFile(templateFilePath, (err) => {
      if (err) {
        logError('File download error: ', err);
        response.status(500).send({ message: 'Error downloading file.' });
      }

      // Optionally delete the file after sending
      fs.unlinkSync(templateFilePath);
    });
  } catch (error: any) {
    logError('router:get template file', error);
    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

export default router;
