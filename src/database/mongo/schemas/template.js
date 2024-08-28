const { Schema } = require('mongoose');
const crypto = require('crypto');

const TemplateSchema = new Schema(
  {
    tid_sod: {
      type: String,
      default: (() => {
        return `0x${crypto.randomBytes(32).toString('hex')}`;
      }),
    },
    cid: String,
    name: String,
    creatorWa: String,
    hashSod: String,
    excelTemplate: String,
    frontendProps: {},
    // endcoded(kekkac(tid_sod + hash_sod))
    encodedSod: String,
    lang: {
      type: String,
      enum: ['pt', 'en', 'es', 'fr'],
      default: 'pt',
    },
    // info stored in chain
    template_chain: {
      sig: [],
      wa_admin: String,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    admin: [],
  },
  { collection: 'template', versionKey: false },
);

TemplateSchema.set('timestamps', true);

// Duplicate the ID field.
TemplateSchema.virtual('tid').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
TemplateSchema.set('toJSON', {
  virtuals: true,
});

module.exports = TemplateSchema;
