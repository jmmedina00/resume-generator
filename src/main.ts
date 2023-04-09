import dotenv from 'dotenv';
import { makeResumes } from './public';
import { promisify } from 'util';
import { getPrivateVersionGenerator } from './private';
import { mkdir, writeFile } from 'fs/promises';
import { prettify } from './util/prettier';

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

  const privateGenerator = await getPrivateVersionGenerator();

  const privateResumes = resumes.map<[string, object[]]>(([code, resume]) => [
    code,
    privateGenerator(resume),
  ]);

  const privateValidations = privateResumes.map(
    async ([code, privateCollection]) => [
      code,
      await Promise.all(privateCollection.map((resume) => validate(resume))),
    ]
  );

  console.log(JSON.stringify(await Promise.all(privateValidations)));
};

main();
