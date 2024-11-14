export enum Sex {
  None = 'None',
  Female = 'Female',
  Male = 'Male',
}

export const toSexPersistance = (value: Sex | null): boolean | null => {
  if (!value || value === Sex.None) {
    return null;
  }

  return value === Sex.Male;
};

export const fromSexPersistance = (value: boolean | null): Sex => {
  if (value === null) {
    return Sex.None;
  }

  return value ? Sex.Male : Sex.Female;
};
