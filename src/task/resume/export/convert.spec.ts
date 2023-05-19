import { RenderContext } from '../../context';
import { getResumeToDocumentConverter } from './convert';

jest.mock('jsonresume-theme-foo', () => ({
  render: jest.fn().mockReturnValue('This is good'),
}));

jest.mock('jsonresume-theme-bar', () => ({
  render: jest.fn().mockReturnValue('This is good'),
}));

describe('Resume to document conversion', () => {
  it('should replace JSON contents with contents provided by theme', async () => {
    const context: RenderContext = {
      contents: JSON.stringify({ foo: 'foo', bar: 'bar' }),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
    };

    const expectedContext: RenderContext = {
      contents: 'This is good',
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
    };

    const converter = getResumeToDocumentConverter('foo');
    await converter(context);

    expect(context).toEqual(expectedContext);

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();
  });
});
