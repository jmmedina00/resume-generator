import { promisify } from 'util';

const schema = require('resume-schema');
const validator = promisify(schema.validate);

export const checkVersionAgainstSchema = (resume: any) => async () => {
  await validator(resume);
};
