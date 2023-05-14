import { ResumeContext, initialContext } from '../../context';
import { FileDescriptor } from '../../describe';
import {
  PRIVATE_DIST,
  PUBLIC_DIST,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';

describe('Resume descriptors', () => {
  it('should produce public descriptors', () => {
    const context: ResumeContext = {
      ...initialContext,
      publicVersions: {
        en: { foo: 'bar' },
        es: { bar: 'baz' },
      },
    };

    const expected: FileDescriptor[] = [
      {
        dir: PUBLIC_DIST,
        name: 'en',
        subfolder: true,
        contents: JSON.stringify({ foo: 'bar' }),
        wantedFormats: ['json', 'html', 'pdf'],
      },
      {
        dir: PUBLIC_DIST,
        name: 'es',
        subfolder: true,
        contents: JSON.stringify({ bar: 'baz' }),
        wantedFormats: ['json', 'html', 'pdf'],
      },
    ];

    const actual = getPublicVersionDescriptors(context);
    expect(actual).toEqual(expected);
  });

  it('should produce private descriptors for all iterations', () => {
    const context: ResumeContext = {
      ...initialContext,
      privateVersions: {
        en: [{ foo: 'bar' }, { x: 'y' }],
        es: [{ bar: 'baz' }, { y: 'z' }],
      },
    };

    const expected: FileDescriptor[] = [
      {
        dir: PRIVATE_DIST,
        name: 'en',
        subversion: '0',
        contents: JSON.stringify({ foo: 'bar' }),
        wantedFormats: ['json', 'pdf'],
      },
      {
        dir: PRIVATE_DIST,
        name: 'en',
        subversion: '1',
        contents: JSON.stringify({ x: 'y' }),
        wantedFormats: ['json', 'pdf'],
      },
      {
        dir: PRIVATE_DIST,
        name: 'es',
        subversion: '0',
        contents: JSON.stringify({ bar: 'baz' }),
        wantedFormats: ['json', 'pdf'],
      },
      {
        dir: PRIVATE_DIST,
        name: 'es',
        subversion: '1',
        contents: JSON.stringify({ y: 'z' }),
        wantedFormats: ['json', 'pdf'],
      },
    ];

    const actual = getPrivateVersionDescriptors(context);
    expect(actual).toEqual(expected);
  });
});
