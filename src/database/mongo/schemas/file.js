'use strict';

const { Schema } = require('mongoose');

const FileSchema = new Schema(
  {
    folder: String,
    files: {
      type: [{
        fileName: { type: String, required: true },
        fileId: {
          type: String,
          required: true,
        },
      }],
      required: true,
    },
  },
  { collection: 'file', versionKey: false },
);

FileSchema.set('timestamps', true);

// Ensure virtual fields are serialised.
FileSchema.set('toJSON', {
  virtuals: true,
});

module.exports = FileSchema;
