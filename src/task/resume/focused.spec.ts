import {
  INCLUDE_IMPORTANT_ONLY,
  handleImportantFlags,
} from '../../mapping/generic';
import { ResumeContext, initialContext } from '../context';
import { generateFocusedVersionsAndCleanPublicOnes } from './focused';

jest.mock('../../mapping/generic');

describe('Focused version generation tasks', () => {
  it('should bring full and focused versions to their respective places', async () => {
    (handleImportantFlags as jest.Mock).mockImplementation(
      (value, handling) => ({
        value,
        focused: handling === INCLUDE_IMPORTANT_ONLY,
      })
    );

    const context: ResumeContext = {
      ...initialContext,
      publicVersions: {
        en: { foo: 'bar', bar: 'baz' },
        es: { foo: 're', bar: 'la' },
      },
    };

    const expectedFinalContext: ResumeContext = {
      ...initialContext,
      publicVersions: {
        en: { value: { foo: 'bar', bar: 'baz' }, focused: false },
        es: { value: { foo: 're', bar: 'la' }, focused: false },
      },
      focusedVersions: {
        en: { value: { foo: 'bar', bar: 'baz' }, focused: true },
        es: { value: { foo: 're', bar: 'la' }, focused: true },
      },
    };

    await generateFocusedVersionsAndCleanPublicOnes(context);
    expect(context).toEqual(expectedFinalContext);
  });
});
