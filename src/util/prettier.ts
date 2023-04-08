import { Options, format, resolveConfig } from 'prettier';

export const convertToPrettyJSON = async (object: any) => {
  return prettify(JSON.stringify(object));
};

export const prettify = async (
  contents: string,
  additionalOptions: Options = {}
) => {
  const options = (await resolveConfig('.prettierrc')) as Options;
  return format(contents, { ...options, ...additionalOptions });
};
