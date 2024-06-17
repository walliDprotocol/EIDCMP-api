const { Schema } = require('mongoose');

const InfractionsSchema = new Schema(
  {
    // i need to add a filed that will be used by i18n for the translation
    translationKey: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: Number, required: true },
    active: { type: Boolean, default: false },
    penaltyPoints: { type: Number, required: true },
    appliedOn: { type: Date, required: false },
  },
  {
    collection: 'infractions',
    versionKey: false,
  },

);

module.exports = {
  schema: InfractionsSchema,
  default: InfractionsSchema,
};
