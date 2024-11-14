export const typedKeys = <T extends Record<string, unknown>>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

export const typedEntries = <T extends Record<string, unknown>>(obj: T) => {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
};

export const typedValues = <T extends Record<string, unknown>>(obj: T) => {
  return Object.values(obj) as Array<T[keyof T]>;
};
