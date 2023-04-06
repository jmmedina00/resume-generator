import { Options, format, resolveConfig } from 'prettier';

export const convertToPrettyJSON = async (object: any) => {
  const options = (await resolveConfig('.prettierrc')) as Options;
  return format(JSON.stringify(object), options);
};
