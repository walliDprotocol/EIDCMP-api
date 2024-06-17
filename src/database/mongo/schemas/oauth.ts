const { Schema } = require('mongoose');

const OAuthSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: false },
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    avatar: { type: String, required: false },
    email: { type: String, required: true },
    name: { type: String, required: true },
    authId: { type: Schema.Types.ObjectId, ref: 'auth' },
  },
  {
    collection: 'oauth',
    versionKey: false,
  },
);

module.exports = {
  schema: OAuthSchema,
  default: OAuthSchema,
};
