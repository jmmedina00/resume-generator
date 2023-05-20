import { Options, resolveConfig } from 'prettier';
import { RenderContext } from '../../context';
import { promisify } from 'util';

const schema = require('resume-schema');

export const getPrettierOptions = async (): Promise<Options> =>
  (await resolveConfig('.prettierrc')) || {};

export const validateResumeWithSchema = async ({
  contents,
}: RenderContext): Promise<void> => {
  const validator = promisify(schema.validate);
  const resume = JSON.parse(contents.toString());
  await validator(resume);
};
