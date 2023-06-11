import { render } from 'mustache';
import { HelperFunctions, applyMustacheTemplateToResource } from './transform';

jest.mock('mustache');

describe('Mustache template applying', () => {
  it('should call render with template as-is and with object and functions combined', async () => {
    const foo = jest.fn();
    const bar = jest.fn();
    const funcs: HelperFunctions = { foo, bar };

    (render as jest.Mock).mockReturnValue('Rendered');

    const runner = applyMustacheTemplateToResource(funcs);
    const result = await runner(
      'Template',
      JSON.stringify({ fizz: 'buzz', re: 'la' })
    );

    expect(result).toEqual('Rendered');
    expect(render).toHaveBeenCalledWith('Template', {
      fizz: 'buzz',
      re: 'la',
      foo,
      bar,
    });
  });
});
