const { Schema } = require('mongoose');

const UserInfractionsSchema = new Schema({
  infractions: { type: Array, required: true },
}, {
  collection: 'userInfractions',
  versionKey: false,
});

module.exports = {
  schema: UserInfractionsSchema,
  default: UserInfractionsSchema,
};
