import dotenv from 'dotenv';
import { makeResumes } from './resume/gen-public';
import { promisify } from 'util';
import { getPrivateVersionGenerator } from './resume/gen-private';
import { EncryptedData, decryptText } from './util/encrypt';
import { getFileContents } from './service/gdrive';
import { parse } from 'yaml';
import { tasks } from './task';

const schema = require('resume-schema');

const main = async () => {
  dotenv.config();
  await tasks.run();

  return;
  const validate = promisify(schema.validate);

  const resumes = await makeResumes('./resume.yml');
  const validations = resumes.map(async ([code, resume]) => [
    code,
    await validate(resume),
  ]);

  console.log(await Promise.all(validations));

  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  const encrypted: EncryptedData = await getFileContents(fileId);
  const privateIterations: any[] = parse(decryptText(encrypted));
  const privateGenerator = await getPrivateVersionGenerator(privateIterations);

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
