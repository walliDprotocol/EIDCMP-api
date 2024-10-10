import { Schema } from 'mongoose';

const tokenSchema = new Schema(
  {
    jwt: String,
    token: String,
  },
  { collection: 'token', versionKey: false },
);
tokenSchema.set('timestamps', true);

export default tokenSchema;
