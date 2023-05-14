import dotenv from 'dotenv';
import { tasks } from './task';

const main = async () => {
  dotenv.config();
  await tasks.run();
};

main();
