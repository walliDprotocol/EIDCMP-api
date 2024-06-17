const { Schema } = require('mongoose');

const TemplateItemSchema = new Schema(
  {
    tid: String,
    cid: String,
    attr: String,
    type: String,
    isPublic: String,
    order: {
      type: Number,
      default: -1,
    },
    table_headers: {},
    table_attr: {},
    sigs: [],
    logos: [],
    isMandatory: {
      type: String,
      enum: ['true', 'false'],
      default: 'true',
    },
    attrFormat: {
      type: String,
      enum: ['keyval', 'table'],
      default: 'keyval',
    },
  },
  { collection: 'templateItem', versionKey: false },
);

// Duplicate the ID field.
// TemplateItemSchema.virtual('temp_item_id').get(function(){
//     return this._id.toHexString();
// });

// Ensure virtual fields are serialised.
// TemplateItemSchema.set('toJSON', {
//     virtuals: true
// });

TemplateItemSchema.set('timestamps', true);

module.exports = TemplateItemSchema;
