export type StringMap = Record<string, string>;

declare global {
  namespace Express {
    export interface User {
      id?: string;
      email?: string;
      authId?: string;
    }

    export interface Locals {
      WaltIdConfig: {
        issuerKey: {
          type: string;
          jwk: {
            kty: string;
            d: string;
            crv: string;
            kid: string;
            x: string;
          };
        };
        issuerDid: string;
      };
    }
  }
}

export type CredentialState = {
  WAITING_WALLET: 'waiting_wallet',
  PENDING_APPROVAL: 'pending_approval',
  REVOKED: 'revoke',
  APPROVED: 'active',
  ACTIVE: 'activeA',
  PENDING: 'pending',
};

export type NewUser = {
  id: string;
  cid: string;
  tid: string;
  waAdmin: string;
  userData: StringMap;
  email: string;
  imgArray: string[];
  publicField: string[];
  status: CredentialState;
};

export * from './schemas';
