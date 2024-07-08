const { Schema } = require('mongoose');

const UserSchema = new Schema(
  {
    tid: String,
    cid: String,
    wa: String,
    email: String,
    shaSod: String,
    user_data: {
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
// UserSchema.set('toJSON', {
//     virtuals: true
// });

module.exports = UserSchema;
