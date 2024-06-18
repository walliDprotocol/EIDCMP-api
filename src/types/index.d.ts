export type StringMap = Record<string, string>;

declare global {
  namespace Express {
    export interface User {
      id?: string;
      email?: string;
      authId?: string;
    }
  }
}

export * from './schemas';
