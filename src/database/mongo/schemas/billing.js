const { Schema } = require('mongoose');

const BillingProfileSchema = new Schema(
  {
    owner_wallet: String,
    owner_email: String,
    create_dca: Number,
    create_template: Number,
    revoke_template: Number,
    revoke_user: Number,
    update_governance: Number,
  },
  { collection: 'billing', versionKey: false },
);

BillingProfileSchema.set('timestamps', true);

module.exports = BillingProfileSchema;
