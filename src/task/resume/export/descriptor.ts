import { ResumeContext } from '../../context';
import { FileDescriptor } from '../../describe';

export const PUBLIC_DIST = './public';
export const PRIVATE_DIST = './private';

export const getPublicVersionDescriptors = ({
  publicVersions,
}: ResumeContext): FileDescriptor[] =>
  Object.keys(publicVersions).map((version) => ({
    dir: PUBLIC_DIST,
    name: version,
    subfolder: true,
    contents: JSON.stringify(publicVersions[version]),
    wantedFormats: ['json', 'html', 'pdf'],
  }));

export const getPrivateVersionDescriptors = ({
  privateVersions,
}: ResumeContext): FileDescriptor[] =>
  Object.keys(privateVersions)
    .flatMap((code) =>
      privateVersions[code].map((_, index) => ({ code, index }))
    )
    .map(({ code, index }) => ({
      dir: PRIVATE_DIST,
      name: code,
      subversion: index.toString(),
      contents: JSON.stringify(privateVersions[code][index]),
      wantedFormats: ['json', 'pdf'],
    }));
