const { Schema } = require('mongoose');

const tokenSchema = new Schema(
  {
    jwt: String,
    token: String,
  },
  { collection: 'token', versionKey: false },
);
tokenSchema.set('timestamps', true);

module.exports = tokenSchema;
