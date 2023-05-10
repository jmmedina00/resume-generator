import { Options, resolveConfig } from 'prettier';
import { RenderContext } from '../context';
import { promisify } from 'util';

const schema = require('resume-schema');

export const getResumeRenderConfig = async (): Promise<
  Partial<RenderContext>
> => {
  const prettierOptions: Options = (await resolveConfig('.prettierrc')) || {};
  const validateFn: (foo: any) => Promise<any> = promisify(schema.validate);

  return { prettierOptions, validateFn };
};
