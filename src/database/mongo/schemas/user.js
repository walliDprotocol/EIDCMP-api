const { Schema } = require('mongoose');

const UserSchema = new Schema(
  {
    tid: String,
    cid: String,
    wa: String,
    email: String,
    shaSod: String,
    userData: {
    // keyval .....,
    // tables ,
    // logos,
    // sigs
    },
    public_field: {},
    admin_meta: {
      wa: String,
      signature: String,
    },
    imgArray: [],
    pdf_url: String,
    credential_img: String,
    inviteId: String,
    revoke_sig: [],
    status: {
      type: String,
      enum: ['waiting_wallet', 'pending_approval', 'active', 'revoke'],
      default: 'waiting_wallet',
    },
    userInfractionsId: {
      type: Schema.Types.ObjectId,
      ref: 'userInfractions',

    },
  },
  { collection: 'user', versionKey: false },
);

UserSchema.set('timestamps', true);

// Ensure virtual fields are serialised.
UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});
module.exports = UserSchema;
