const { Schema } = require('mongoose');

const AdminSchema = new Schema(
  {
    wa: String,
    email: String,
    billing_profile: String,
    username: {
      type: String,
      required: false,
    },
    roles: {
      type: [String],
      required: false,
    },
  },
  { collection: 'admin', versionKey: false },
);

AdminSchema.set('timestamps', true);

module.exports = AdminSchema;
