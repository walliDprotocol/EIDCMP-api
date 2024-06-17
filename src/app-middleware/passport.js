const { Router } = require('express');
const { logDebug } = require('src/core-services/logFunctionFactory').getLogger('passport');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const { handleUserLogin } = require('src/services/oauth');

const {
  TOKEN_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require('src/config').default;

const router = Router();
router.use(passport.initialize());
router.use(passport.session());

const JwtOptions = {
  secretOrKey: TOKEN_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true,
};

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  },
  ((request, accessToken, refreshToken, profile, done) => {
    handleUserLogin({
      accessToken,
      refreshToken,
      profile,
      done,
    });
  }),
));

passport.use(
  new JwtStrategy(JwtOptions, async ({ path }, payload, done) => {
    logDebug('User JWT', path, payload, done);
    return done(null, {
      ...payload,
      strategy: 'jwt',
    });
  }),
);

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// used to deserialize the user
passport.deserializeUser(async (user, done) => {
  try {
    logDebug('deserializeUser user  ', user);
    done(null, user);
  } catch (ex) {
    done(ex);
  }
});

module.exports = () => router;
