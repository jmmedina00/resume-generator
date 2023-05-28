import { readdir } from 'fs/promises';
import { basename } from 'path';
import { getRecursiveFileList } from './io';

jest.mock('fs/promises');

describe('IO utils', () => {
  it('should read all files in a directory recursively, excluding folders themselves', async () => {
    (readdir as jest.Mock).mockImplementation(async (path) => {
      const name = basename(path);
      const isDirectoryTrue = jest.fn().mockReturnValue(true);
      const isDirectoryFalse = jest.fn().mockReturnValue(false);

      if (name === 'foo')
        return [
          { name: 're.txt', isDirectory: isDirectoryFalse },
          { name: 'bar', isDirectory: isDirectoryTrue },
          { name: 'la.png', isDirectory: isDirectoryFalse },
        ];

      if (name === 'bar')
        return [
          { name: 'baz', isDirectory: isDirectoryTrue },
          { name: 'shi.doc', isDirectory: isDirectoryFalse },
        ];

      if (name === 'baz')
        return [
          { name: 'fu.py', isDirectory: isDirectoryFalse },
          { name: 'chang.json', isDirectory: isDirectoryFalse },
        ];
    });

    const path = './foo';

    const expected = [
      './foo/bar/baz/chang.json',
      './foo/bar/baz/fu.py',
      './foo/bar/shi.doc',
      './foo/la.png',
      './foo/re.txt',
    ];

    const actual = await getRecursiveFileList(path);
    actual.sort();
    expect(actual).toEqual(expected);
  });
});
