import { LocalisedObject } from '../../../../../mapping/locale.types';
import { getNavigationBar } from '../../../../../resume/generation/public';
import { getNavbarGenerator } from './transform';

jest.mock('../../../../../resume/generation/public');

describe('Navbar applying', () => {
  it('should adapt get navigation bar existing function', async () => {
    (getNavigationBar as jest.Mock).mockReturnValue('navvy');

    const object: LocalisedObject = {
      flattened: { foo: 'bar' },
      locales: { en: {}, es: {} },
    };

    const runner = getNavbarGenerator(object, 'es');
    const result = await runner('temp');

    expect(result).toEqual('navvy');
    expect(getNavigationBar).toHaveBeenCalledWith('temp', object, 'es');
  });
});
