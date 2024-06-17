import config from 'src/config';

const { TOKEN_SECRET } = config;

const session = require('express-session');
const { Router } = require('express');

const router = Router();

const oneDay = 1000 * 60 * 60 * 24;

router.use(
  session({
    name: 'sm.api',
    secret: TOKEN_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  }),
);

export = function sessionFactory() {
  return router;
};
