import { Options, format } from 'prettier';

export const adaptPrettierFormat = async (
  source: string,
  jsonOptions: string
) => {
  const options: Options = JSON.parse(jsonOptions);
  return format(source, options);
};
