import { getPrivateVersionGenerator } from '../resume/gen-private';
import { ResumeContext, initialContext } from './context';
import { generatePrivateVersions } from './private';

jest.mock('../resume/gen-private');

describe('Private version tasks', () => {
  it('should generate and store private versions from context iterators', async () => {
    const context: ResumeContext = {
      ...initialContext,
      privateIterations: [{ foo: 'bar' }, { bar: 'baz' }],
      publicVersions: {
        en: { test: 'Testing' },
        es: { test: 'Probando' },
      },
    };

    const expectedFinalContext: ResumeContext = {
      ...context,
      privateVersions: {
        en: [{ generated: true }, { public: false }],
        es: [{ generated: true }, { public: false }],
      },
    };

    const generator = jest
      .fn()
      .mockReturnValue([{ generated: true }, { public: false }]);

    (getPrivateVersionGenerator as jest.Mock).mockReturnValue(generator);

    await generatePrivateVersions(context);
    expect(context).toEqual(expectedFinalContext);

    expect(getPrivateVersionGenerator).toHaveBeenCalledWith([
      { foo: 'bar' },
      { bar: 'baz' },
    ]);
    expect(generator).toHaveBeenCalledWith({ test: 'Testing' });
    expect(generator).toHaveBeenCalledWith({ test: 'Probando' });
  });
});
