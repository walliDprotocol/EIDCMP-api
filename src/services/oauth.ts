import { DB } from 'src/database';
import { registerUser } from 'src/services/auth';
import { DataBaseSchemas } from 'src/types/enums';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('services:oauth');

type GoogleOAuthData = {
  accessToken: string;
  refreshToken: string;
  profile: any;
  done: any;
};

const handleUserLogin = async ({
  accessToken, refreshToken, profile, done,
}:GoogleOAuthData) => {
  logDebug(' **** google oauth **** ', profile, accessToken, refreshToken, done);
  try {
    const user = await DB.findOne(DataBaseSchemas.OAUTH, { providerId: profile.id }, {}, {});

    logDebug('User found', user);
    if (!user) {
      const newUserRegister = await registerUser({
        username: profile.displayName,
        email: profile.emails[0].value,
        type: 'GoogleOAuth',
      });

      // TODO: maybe we should automatically create the invite id

      const newUser = await DB.create(DataBaseSchemas.OAUTH, {
        providerId: profile.id,
        provider: 'google',
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        accessToken,
        refreshToken,
        authId: newUserRegister._id,
      });
      logDebug('Created user', newUser.toJSON());
      return done(null, newUser);
    }
    return done(null, user);
  } catch (error: any) {
    logError('issue login user ', error);
    return done(error, null);
  }
};

export = { handleUserLogin };
