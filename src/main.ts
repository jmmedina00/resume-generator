import dotenv from 'dotenv';
import { makeResumes } from './public';
import { promisify } from 'util';

const schema = require('resume-schema');

const main = async () => {
  dotenv.config();
  const validate = promisify(schema.validate);

  const resumes = await makeResumes('./resume.yml');
  const validations = resumes.map(async ([code, resume]) => [
    code,
    await validate(resume),
  ]);

  console.log(await Promise.all(validations));
};

main();
