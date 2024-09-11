export function hasSameProperties<T extends object>(obj: T, keys: Array<keyof T>): boolean {
  const typeKeys = Object.keys(obj) as Array<keyof T>;
  return keys.every((key) => {
    return typeKeys.includes(key as keyof object);
  });
}
export function isArrayOf<T extends object>(arr: Array<T>, keys: Array<keyof T>): boolean {
  return Array.isArray(arr) && arr.length > 0 && arr.every((element) => hasSameProperties<T>(element, keys));
}

export const isInstanceOf = <T>(ctor: { new (...args: any): T }) => {
  return (x: any): x is T => x instanceof ctor;
};

export function filterObject(raw: Record<string, unknown>, allowed: string[]) {
  return Object.keys(raw)
    .filter((key) => allowed.includes(key))
    .reduce((object: Record<string, unknown>, key) => {
      const obj = { ...object };
      obj[key] = raw[key];
      return obj;
    }, {});
}

export function isEmptyObject(obj: Record<string, unknown> = {}): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
