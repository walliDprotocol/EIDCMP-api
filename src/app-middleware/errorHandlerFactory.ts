import {
  NextFunction, Request, Response,
} from 'express';

const { logError } = require('src/core-services/logFunctionFactory').getLogger('errorHandler');

const errorTypes = {
  badRequest: Symbol.for('bad request'),
  loginFailed: Symbol.for('login failed'),
  notFound: Symbol.for('not found'),
};

export = function errorHandlerFactory() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
    } else if (err.status === 400 || err.errorType === errorTypes.badRequest) {
      res.status(400).json({ message: err.message });
    } else if (err.status === 401 || err.errorType === errorTypes.loginFailed) {
      res.status(401).json({ message: 'Unauthorized API access!' });
    } else if (err.status === 404 || err.errorType === errorTypes.notFound) {
      logError('Route not found: ', req.originalUrl, ' METHOD [', req.method, '] BODY ', req.body, ' QUERY ', req.query, ' ERROR: ', err.message, ' STACK: ', err.stack);
      res.status(404).json({ message: err.message });
    } else {
      next(err);
    }
  };
};
