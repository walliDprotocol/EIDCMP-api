import { UUID } from 'crypto';

export type TokenEntry = {
  id:UUID;
  token: string;
  name: string;
  dateCreated: Date;
  lastUsed?: Date | string;
};
