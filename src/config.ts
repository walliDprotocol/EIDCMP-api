const cfg = require('12factor-config');

// eslint-disable-next-line no-shadow
enum EnvEnum {
  ALLOWED_HEADERS = 'allowedHeaders',
  ALLOWED_ORIGINS = 'allowedOrigins',
  APP_NAME = 'appName',
  DEBUG = 'debug',
  DESIRED_PORT = 'PORT',
  ENABLE_CORS = 'enableCORS',
  NODE_ENV = 'nodeEnv',
  DOMAIN_ENV = 'DOMAIN_ENV',
  ACCEPTED_LANGS = 'acceptedLanguages',

  TOKEN_SECRET = 'TOKEN_SECRET',
  ALLOW_REGISTER = 'ALLOW_REGISTER',
  TESTING = 'TESTING',

  DB_HOST = 'DB_HOST',
  DB_USER = 'DB_USER',
  DB_PASS = 'DB_PASS',
  DB_NAME = 'DB_NAME',
  COMPLEMENT = 'COMPLEMENT',

  SEND_GRID_API_KEY = 'SEND_GRID_API_KEY',
  EMAIL_SENDER = 'EMAIL_SENDER',
  USER_INVITE = 'USER_INVITE',
  ADMIN_INVITE = 'ADMIN_INVITE',

  FRONTEND_URL = 'FRONTEND_URL',
  GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK_URL = 'GOOGLE_CALLBACK_URL',

  // WaltId
  WALTID_PUBLIC_VERIFIER = 'WALTID_PUBLIC_VERIFIER',
  WALTID_PUBLIC_ISSUER = 'WALTID_PUBLIC_ISSUER',
  WALTID_PUBLIC_WALLET = 'WALTID_PUBLIC_WALLET',
}

const env = {
  allowedHeaders: {
    env: 'ALLOWED_HEADERS',
    type: 'string',
  },
  allowedOrigins: {
    env: 'ALLOWED_ORIGINS',
    type: 'string',
  },
  appName: {
    env: 'APP_NAME',
    type: 'string',
    required: false,
  },
  debug: {
    env: 'DEBUG',
    type: 'string',
    // required: true,
  },
  PORT: {
    env: 'PORT',
    type: 'integer',
    required: true,
  },
  enableCORS: {
    env: 'ENABLE_CORS',
    type: 'boolean',
  },
  nodeEnv: {
    env: 'NODE_ENV',
    type: 'enum',
    values: ['development', 'production'],
    default: 'development',
  },
  DOMAIN_ENV: {
    env: 'DOMAIN_ENV',
    type: 'string',
    required: true,
  },
  acceptedLanguages: {
    env: 'ACCEPTED_LANGS',
    type: 'string',
    required: false,
  },
  TOKEN_SECRET: {
    env: 'TOKEN_SECRET',
    type: 'string',
    required: true,
  },
  ALLOW_REGISTER: {
    env: 'ALLOW_REGISTER',
    type: 'boolean',
    default: false,
  },
  TESTING: {
    env: 'TESTING',
    type: 'boolean',
    default: false,
  },
  DB_HOST: {
    env: 'DB_HOST',
    type: 'string',
    required: true,
  },
  DB_USER: {
    env: 'DB_USER',
    type: 'string',
    required: true,
  },
  DB_PASS: {
    env: 'DB_PASS',
    type: 'string',
    required: true,
  },
  DB_NAME: {
    env: 'DB_NAME',
    type: 'string',
    required: true,
  },
  COMPLEMENT: {
    env: 'COMPLEMENT',
    type: 'string',
    required: true,
  },
  SEND_GRID_API_KEY: {
    env: 'SEND_GRID_API_KEY',
    type: 'string',
    required: true,
  },
  EMAIL_SENDER: {
    env: 'EMAIL_SENDER',
    type: 'string',
    required: true,
  },
  USER_INVITE: {
    env: 'USER_INVITE',
    type: 'string',
    required: true,
  },
  ADMIN_INVITE: {
    env: 'ADMIN_INVITE',
    type: 'string',
    required: true,
  },
  FRONTEND_URL: {
    env: 'FRONTEND_URL',
    type: 'string',
    required: false,
  },
  GOOGLE_CLIENT_ID: {
    env: 'GOOGLE_CLIENT_ID',
    type: 'string',
    required: true,
  },
  GOOGLE_CLIENT_SECRET: {
    env: 'GOOGLE_CLIENT_SECRET',
    type: 'string',
    required: true,
  },
  GOOGLE_CALLBACK_URL: {
    env: 'GOOGLE_CALLBACK_URL',
    type: 'string',
    required: true,
  },
  WALTID_PUBLIC_VERIFIER: {
    env: 'WALTID_PUBLIC_VERIFIER',
    type: 'string',
    required: true,
  },
  WALTID_PUBLIC_ISSUER: {
    env: 'WALTID_PUBLIC_ISSUER',
    type: 'string',
    required: true,
  },
  WALTID_PUBLIC_WALLET: {
    env: 'WALTID_PUBLIC_WALLET',
    type: 'string',
    // required: true,
  },
} as const;

type TypeMapping = {
  'string': string;
  'number': number;
  'boolean': boolean;
  'integer': number;
  'enum': string;
};

export type Config = {
  [key in EnvEnum]: typeof env[key]['type'] extends keyof TypeMapping ? TypeMapping[typeof env[key]['type']] : never;
};

const config: Config = cfg(env);

export default config;
