import { format, join } from 'path';
import { FileDescriptor, getDescribedPath } from './describe';

describe('File descriptor', () => {
  const unimportantFeatures: Partial<FileDescriptor> = {
    contents: 'foo',
  };

  // Generated with some help from ChatGPT
  const parameters = [
    ['Silly_Sallys_Studio', 'Codezilla', 'json', 'ka'],
    ['Bananasaurus_Rex', 'DataDiva', 'csv', 'ki'],
    ['Penguin_Palace', 'PixelParty', 'html', 'ku'],
    ['Unicorn_Universe', 'ProjectPhoenix', 'html', 'ke'],
    ['Funky_Monkey_Files', 'BugBeGone', 'sql', 'ko'],
  ];

  const nonHtmlParameters = parameters.filter(
    ([foo, bar, format]) => format !== 'html'
  );

  describe('with only directory and name', () => {
    it.each(parameters)('should yield %s/%s.%s', (dir, name, ext) => {
      const expected = format({
        name,
        dir,
        ext: '.' + ext,
      });

      const descriptor: FileDescriptor = {
        ...(unimportantFeatures as FileDescriptor),
        dir,
        name,
      };

      const actual = getDescribedPath(descriptor, ext);
      expect(actual).toEqual(expected);
    });
  });

  describe('with directory, name and subversion', () => {
    it.each(parameters)(
      'should yield in folder %s combination of name, subversion and extension',
      (dir, name, ext, subversion) => {
        const expected = format({
          name: name + '-' + subversion,
          dir,
          ext: '.' + ext,
        });

        const descriptor: FileDescriptor = {
          ...(unimportantFeatures as FileDescriptor),
          dir,
          name,
          subversion,
        };

        const actual = getDescribedPath(descriptor, ext);
        expect(actual).toEqual(expected);
      }
    );
  });

  describe('with directory and name, subfolder enabled and non-HTML file', () => {
    it.each(nonHtmlParameters)(
      'should yield %s/%s/resume.%s',
      (dir, name, ext) => {
        const expected = format({
          name: 'resume',
          dir: join(dir, name),
          ext: '.' + ext,
        });

        const descriptor: FileDescriptor = {
          ...(unimportantFeatures as FileDescriptor),
          dir,
          name,
          subfolder: true,
        };

        const actual = getDescribedPath(descriptor, ext);
        expect(actual).toEqual(expected);
      }
    );
  });

  describe('with directory, name and subversion, subfolder enabled and non-HTML file', () => {
    it.each(nonHtmlParameters)(
      'should yield in folder %s/%s with extension %s and name %s',
      (dir, name, ext, subversion) => {
        const expected = format({
          name: subversion,
          dir: join(dir, name),
          ext: '.' + ext,
        });

        const descriptor: FileDescriptor = {
          ...(unimportantFeatures as FileDescriptor),
          dir,
          name,
          subversion,
          subfolder: true,
        };

        const actual = getDescribedPath(descriptor, ext);
        expect(actual).toEqual(expected);
      }
    );
  });

  describe('with directory and name, subfolder enabled and HTML file', () => {
    it.each(parameters)('should %s/%s/index.html', (dir, name) => {
      const expected = format({
        base: 'index.html',
        dir: join(dir, name),
      });

      const descriptor: FileDescriptor = {
        ...(unimportantFeatures as FileDescriptor),
        dir,
        name,
        subfolder: true,
      };

      const actual = getDescribedPath(descriptor, 'html');
      expect(actual).toEqual(expected);
    });
  });

  describe('with directory, name and subversion, subfolder enabled and HTML file', () => {
    it.each(parameters)(
      'should yield in folder %s/%s in HTML and name %s',
      (dir, name, _, subversion) => {
        const expected = format({
          name: subversion,
          dir: join(dir, name),
          ext: '.html',
        });

        const descriptor: FileDescriptor = {
          ...(unimportantFeatures as FileDescriptor),
          dir,
          name,
          subversion,
          subfolder: true,
        };

        const actual = getDescribedPath(descriptor, 'html');
        expect(actual).toEqual(expected);
      }
    );
  });
});
