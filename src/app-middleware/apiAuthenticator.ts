import { NextFunction, Request, Response } from 'express';

import { ErrorType, errors } from 'src/constants';

const {
  Router,
} = require('express');
const passport = require('passport');

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('middleware:apiAuthenticator');
const { getApiToken } = require('src/services/auth');

const { UNAUTHORIZED } = ErrorType;

/**
 * Routes that need authentication
 */
const authRoutes = [
  '/api/v1/',
  '/api/v1/auth/profile',
  '/api/v1/auth/key',
  '/api/v1/auth/keys',
];
const authRoutesException = [
  '/api/v1/auth/',
  '/api/v1/admin/invite-demo',
  '/api/v1/ftp',
  '/api/v1/infractions',
  '/api/v1/user',
  '/api/v1/assets/backgrounds',
  '/api/v1/credential/redirect',
  '/api/v1/credential/data',

];

const signValidatorHandler = async (req: Request, res: Response, next: NextFunction) => {
  logDebug(' API AUTHENTICATOR', `URL: ${req.originalUrl} METHOD: ${req.method}`);

  const { authorization } = req.headers;

  const calledUrl = req.originalUrl.split('?')[0];
  if (authRoutes.some((route) => calledUrl.includes(route))
   && !authRoutesException.some((route) => calledUrl.includes(route) && !authRoutes.includes(calledUrl))) {
    try {
      logDebug('authorization', authorization);
      if (!authorization) {
        return res.status(errors[UNAUTHORIZED].status).json(errors[UNAUTHORIZED].msg);
      }
      const token = authorization.split('Bearer ')[1];

      if (typeof token === 'string' && token.startsWith('WalliD-')) {
        const jwt = await getApiToken(token);
        logDebug('jwt', jwt);
        req.headers.authorization = `Bearer ${jwt}`;
        logDebug('req.headers.authorization ', req.headers.authorization);
      }

      return passport.authenticate('jwt', { session: false })(req, res, next);
    } catch (error) {
      logError('Error in middleware ', error);
      return res.status(401).json({ message: 'not logged by middleware' });
    }
  } else {
    logDebug('Bypassing authorization for url: ', calledUrl);
    return next();
  }
};

export = () => Router().use('/api', signValidatorHandler);
