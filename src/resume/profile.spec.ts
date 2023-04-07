import { getCoreUserInfo } from '../github';
import { PartialProfiles, Profile, getFullProfiles } from './profile';

jest.mock('../github');

describe('Profile deflating', () => {
  (getCoreUserInfo as jest.Mock).mockResolvedValue({
    fullName: 'Pedro Jiménez',
  });

  it('should not accept any entry that is missing both URL and username', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi' },
      empty: {},
    };

    expect(getFullProfiles(partials)).rejects.toThrow();
  });

  it('should populate network with key as-is', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi' },
      bar: { url: 'http://test.local' },
    };

    const expected: Partial<Profile>[] = [
      { network: 'foo' },
      { network: 'bar' },
    ];

    const actual = (await getFullProfiles(partials)).map(({ network }) => ({
      network,
    }));
    expect(actual).toEqual(expected);
  });

  it('should leave everything alone if everything is populated', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi', url: 'http://nothing.alike' },
    };

    const actual = (await getFullProfiles(partials)).map(
      ({ network, ...result }) => result
    );
    expect(actual).toEqual([
      { username: 'juanmi', url: 'http://nothing.alike' },
    ]);
  });

  it('should populate username with full name from GitHub when only URL is provided; URL remains as-is', async () => {
    const partials: PartialProfiles = {
      foo: { url: 'http://server.local' },
      bar: { url: 'http://test.local' },
    };

    const expected: Partial<Profile>[] = [
      { username: 'Pedro Jiménez', url: 'http://server.local' },
      { username: 'Pedro Jiménez', url: 'http://test.local' },
    ];

    const actual = (await getFullProfiles(partials)).map(
      ({ network, ...result }) => result
    );
    expect(actual).toEqual(expected);
  });

  it('should populate url with <network>.com/<user> when no URL is provided; username remains as-is', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi' },
      baz: { username: 'jmmedina' },
      re: { username: 'regexboy' },
    };

    const expected: Partial<Profile>[] = [
      { username: 'juanmi', url: 'https://foo.com/juanmi' },
      { username: 'jmmedina', url: 'https://baz.com/jmmedina' },
      { username: 'regexboy', url: 'https://re.com/regexboy' },
    ];

    const actual = (await getFullProfiles(partials)).map(
      ({ network, ...result }) => result
    );
    expect(actual).toEqual(expected);
  });

  it('should populate url with <network>/<user> if the network is a full domain name', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi' },
      'share.io': { username: 'jmmedina' },
    };

    const expected: Partial<Profile>[] = [
      { username: 'juanmi', url: 'https://foo.com/juanmi' },
      { username: 'jmmedina', url: 'https://share.io/jmmedina' },
    ];

    const actual = (await getFullProfiles(partials)).map(
      ({ network, ...result }) => result
    );
    expect(actual).toEqual(expected);
  });

  it('should be able to do all cases at the same time', async () => {
    const partials: PartialProfiles = {
      foo: { username: 'juanmi' },
      bar: { url: 'http://test.local' },
      'share.io': { username: 'jmmedina' },
    };

    const expected: Partial<Profile>[] = [
      { username: 'juanmi', url: 'https://foo.com/juanmi' },
      { username: 'Pedro Jiménez', url: 'http://test.local' },
      { username: 'jmmedina', url: 'https://share.io/jmmedina' },
    ];

    const actual = (await getFullProfiles(partials)).map(
      ({ network, ...result }) => result
    );
    expect(actual).toEqual(expected);
  });
});
