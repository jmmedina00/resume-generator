import { join } from 'path';
import { ResumeContext, initialContext } from '../../context';
import { FileDescriptor } from '../../describe';
import {
  PRIVATE_DIST,
  PUBLIC_DIST,
  getFocusedVersionDescriptors,
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
      },
      {
        dir: PUBLIC_DIST,
        name: 'es',
        subfolder: true,
        contents: JSON.stringify({ bar: 'baz' }),
      },
    ];

    const actual = getPublicVersionDescriptors(context);
    expect(actual).toEqual(expected);
  });

  it('should produce focused descriptors', () => {
    const context: ResumeContext = {
      ...initialContext,
      focusedVersions: {
        en: { foo: 'bar' },
        es: { bar: 'baz' },
      },
    };

    const expected: FileDescriptor[] = [
      {
        dir: join(PUBLIC_DIST, 'en'),
        name: 'focused',
        subfolder: true,
        contents: JSON.stringify({ foo: 'bar' }),
      },
      {
        dir: join(PUBLIC_DIST, 'es'),
        name: 'focused',
        subfolder: true,
        contents: JSON.stringify({ bar: 'baz' }),
      },
    ];

    const actual = getFocusedVersionDescriptors(context);
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
      },
      {
        dir: PRIVATE_DIST,
        name: 'en',
        subversion: '1',
        contents: JSON.stringify({ x: 'y' }),
      },
      {
        dir: PRIVATE_DIST,
        name: 'es',
        subversion: '0',
        contents: JSON.stringify({ bar: 'baz' }),
      },
      {
        dir: PRIVATE_DIST,
        name: 'es',
        subversion: '1',
        contents: JSON.stringify({ y: 'z' }),
      },
    ];

    const actual = getPrivateVersionDescriptors(context);
    expect(actual).toEqual(expected);
  });
});
