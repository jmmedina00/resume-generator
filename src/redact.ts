import dotenv from 'dotenv';
import { redactTasks } from './task/redact';

const main = async () => {
  dotenv.config();
  await redactTasks.run();
};

main();
