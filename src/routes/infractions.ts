import { Router, Request, Response } from 'express';
// import config from 'src/config';
import { addInfraction, getListInfractions } from 'src/services/infractions';

// const { } = config;

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:infractions');

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Get infractions **** ');

    const infractionsList = await getListInfractions();
    return res.json({ infractionsList });
  } catch (error: any) {
    logError('Error getting infractions ', error);
    return res.status(500).send({ error: error?.message });
  }
});

// create a route that adds a new infraction to the user with the given id
router.post('/add-infraction', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Add infraction **** ');

    const { infractionId, userInfractionsId } = req.body;
    logDebug('infractionId', infractionId);
    logDebug('userInfractionsId', userInfractionsId);

    const userInfraction = await addInfraction(userInfractionsId, infractionId);

    return res.json({ userInfractionsId, userInfraction });
  } catch (error: any) {
    logError('Error adding infraction to user ', error);
    return res.status(500).send({ error: error?.message });
  }
});

export default router;
