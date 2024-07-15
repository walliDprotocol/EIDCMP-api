import { Request, Response, Router } from 'express';
import path from 'path';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:assets');

const router = Router();

router.get('/backgrounds/:id', async (req: Request, res: Response) => {
  const assetId = req.params.id;
  logDebug('assetId', assetId);

  try {
    res.sendFile(path.join(__dirname, `./assets/backgrounds/${assetId}`));
  } catch (error) {
    logError('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
