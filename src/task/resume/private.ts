import { getPrivateVersionGenerator } from '../../resume/generation/private';
import { ResumeContext } from '../context';

export const generatePrivateVersions = async (
  ctx: ResumeContext
): Promise<void> => {
  const privateVersionGenerator = await getPrivateVersionGenerator(
    ctx.privateIterations
  );

  const generated = Object.fromEntries(
    Object.entries(ctx.publicVersions).map(([code, resume]) => [
      code,
      privateVersionGenerator(resume),
    ])
  );

  ctx.privateVersions = generated;
};
