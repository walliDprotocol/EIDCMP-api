import { Document, Schema } from 'mongoose';
import { TokenEntry } from 'src/types/auth';

const bcrypt = require('bcryptjs');

const TokenEntrySchema = new Schema<TokenEntry & Document>({
  id: { type: String, required: true },
  token: { type: String, required: true },
  name: { type: String, required: true },
  dateCreated: { type: Date, required: true },
  lastUsed: { type: Date, required: false },
});

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
    tokens: [TokenEntrySchema],

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

AuthSchema.methods.verifyPassword = function verifyPassword(pw:string) {
  return bcrypt.compareSync(pw, this.password);
};

AuthSchema.methods.setPassword = function setPassword(pw: string) {
  this.password = bcrypt.hashSync(pw, bcrypt.genSaltSync(10), null);
};

AuthSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

export default AuthSchema;
