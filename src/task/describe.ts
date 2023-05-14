import { format, join } from 'path';

const CUSTOM_NAMES: { [ext: string]: string } = {
  html: 'index',
};

const DEFAULT_NAME_IN_SUBFOLDER = 'resume';

export interface FileDescriptor {
  dir: string;
  subfolder?: boolean;

  name: string;
  subversion?: string;
  contents: string;

  wantedFormats: string[];
}

export const getDescribedPath = (
  { dir, subfolder, name, subversion }: FileDescriptor,
  ext: string
): string => {
  const dirDescription = !!subfolder ? [dir, name] : [dir];

  const finalName = !!subfolder
    ? subversion ?? CUSTOM_NAMES[ext] ?? DEFAULT_NAME_IN_SUBFOLDER
    : [name, subversion].filter((foo) => !!foo).join('-');

  return format({
    dir: join(...dirDescription),
    name: finalName,
    ext: '.' + ext,
  });
};
