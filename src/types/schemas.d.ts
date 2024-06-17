export type DataBase = {
  create: (schema: SMSchemas, data: any, options?: any) => Promise<any>,
  find: (schema: SMSchemas, filter: any, select?: any, options?: any) => Promise<any>,
  findOne: (schema: SMSchemas, filter: any, select?: any, options?: any) => Promise<any>,
  findOneAndUpdate: (schema: SMSchemas, filter: any, update?: any, options?: any) => Promise<any>,
  insertMany: (schema: SMSchemas, data: any, options?: any) => Promise<any>,
  [method: string]: (...args: any[]) => Promise<any>;
};
export const b = 1;
