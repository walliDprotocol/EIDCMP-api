import { Router, Request, Response } from 'express';
import parameterValidator from 'src/core-services/parameterValidator';
import {
  issueTokenForUser, loginUser, userProfile, issueApiToken, registerApiToken,
} from 'src/services/auth';
import { filterObject } from 'src/lib/util';

import config from 'src/config';
import passport from 'passport';
import { issueJWT, verifyJWT } from 'src/lib/jwt';

const {
  ALLOW_REGISTER,
  GOOGLE_CALLBACK_URL,
} = config;

const { registerUser, registerUserAdminInvite } = require('src/services/auth');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:auth');

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  if (!ALLOW_REGISTER) return res.status(403).json({ error: 'Register currently disabled' });
  try {
    logDebug(' **** register route **** ');
    const params = ['username', 'password', 'email'];
    parameterValidator(req.body, params);

    if (req.body.adminInvite) {
      const newUser = await registerUserAdminInvite(req.body);
      return res.json({ user: newUser });
    }

    const newUser = await registerUser(req.body);
    return res.json({ user: newUser });
  } catch (error: any) {
    logError('issue register new user ', error);
    return res.status(500).send({ error: error?.message });
  }
});

// TODO: refactor
router.post('/login', async (req, res) => {
  logDebug(' **** login route **** ', req.user);
  try {
    const { username, password } = req.body;

    const user = await loginUser({ username, password });

    return res.status(200).json(user);
  } catch (err) {
    logDebug(err);
    if (err instanceof Error) {
      logDebug(err.message);
      return res.status(403).json({ errorStatus: err.message });
    }
    return res.status(500).json({ errorStatus: err });
  }
});

router.get('/profile', async (req, res) => {
  logDebug(' **** profile route **** ', req.user);

  const user = await userProfile(req.user);

  res.json(user);
});

/**
 *
 *  Google authenticator
 * */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  logDebug(' **** google callback route **** ', req.user);
  const { token } = issueTokenForUser({ id: req?.user?.authId });
  // Send token to client
  logDebug(token);

  res.redirect(`${GOOGLE_CALLBACK_URL}${token}`);
});

router.get('/google/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/gen-key', async (req: Request, res: Response) => {
  try {
    logDebug(' **** Auth token route **** ');
    const { user } = req;
    const { name = 'Default Name' } = req.query as unknown as { name: string };
    logDebug(' ****name ****', name);
    logDebug(' ****user ****', user);

    const filter = ['id', 'username', 'email'];
    const userFiltered = filterObject(user as unknown as Record<string, unknown>, filter);
    logDebug(' ****user **** after', userFiltered);

    const { token } = await issueApiToken();

    const jwtPayload = {
      id: userFiltered.id,
      token,
    };
    const { token: jwt } = await issueJWT(userFiltered.id as string, jwtPayload, '999years');
    logDebug('jwt', jwt);

    const result = await registerApiToken(user?.id, token, jwt, name);
    logDebug('result', result);

    const verify = await verifyJWT(jwt);
    logDebug('verify', verify);
    if (!verify) {
      res.status(401).json('Unauthorized');
    }

    res.json({
      token,
      jwt,
      name,
    });
  } catch (ex) {
    logError('/gen-key ', ex);
    res.status(500).json({ error: ex });
  }
});

export default router;
