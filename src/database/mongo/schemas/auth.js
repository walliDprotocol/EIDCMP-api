const { Schema } = require('mongoose');

const bcrypt = require('bcryptjs');

const AuthSchema = new Schema(
  {
    ext_id: String,
    username: String,
    email: String,
    password: String,
    photo: String,
    userData: String,
    walletAddress: String,
    organization: { type: Schema.Types.ObjectId, ref: 'organization' },
    type: {
      type: String,
      required: false,
    },
  },
  { collection: 'auth', versionKey: false },
);
AuthSchema.set('timestamps', true);
// sessionSchema .createIndex({ closeOfferAt: 1 }, { expireAfterSeconds: 300 });

// UserSchema.prototype.validPass = function (pw) {
//   console.log('password');
//   return bcrypt.compareSync(pw, this.password);
// };

// UserSchema.addHook('beforeCreate', (newUser) => {
//   newUser.password = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(10), null);
// });

AuthSchema.methods.verifyPassword = function verifyPassword(pw) {
  return bcrypt.compareSync(pw, this.password);
};

AuthSchema.methods.setPassword = function setPassword(pw) {
  this.password = bcrypt.hashSync(pw, bcrypt.genSaltSync(10), null);
};

AuthSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

module.exports = AuthSchema;
