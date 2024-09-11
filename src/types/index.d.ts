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

export type UserCredentialType = {
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

export type CredentialTemplateType = {
  cid: string;
  name: string;
  wa: string;
  lang: any;
  frontendProps: any;
};

export * from './schemas';
