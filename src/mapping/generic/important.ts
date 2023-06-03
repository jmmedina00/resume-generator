import { isPlainType, regenerateFromEntries } from '../common';

export const INCLUDE_EVERYTHING = 1;
export const INCLUDE_IMPORTANT_ONLY = 2;

const IMPORTANT_FLAG = 'important';

export const handleImportantFlags = (
  data: any,
  handling: number = INCLUDE_EVERYTHING
): any => {
  if (handling === INCLUDE_IMPORTANT_ONLY && data[IMPORTANT_FLAG] === false) {
    return {}; // Assuming data is object in this case
  }

  return regenerateFromEntries(
    Object.entries(data)
      .filter(([key]) => key !== IMPORTANT_FLAG)
      .map(
        ([key, value]) =>
          [
            key,
            isPlainType(value) ? value : handleImportantFlags(value, handling),
          ] as [string, any]
      )
      .filter(
        ([key, value]) => isPlainType(value) || Object.keys(value).length > 0
      ),
    Object.getPrototypeOf(data)
  );
};
