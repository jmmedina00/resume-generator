import { transformWithTheme } from './transform';

jest.mock('jsonresume-theme-foo', () => ({
  render: jest.fn().mockReturnValue('This is good'),
}));

jest.mock('jsonresume-theme-bar', () => ({
  render: jest.fn().mockReturnValue('This is bad'),
}));

describe('JSON Resume theme applying', () => {
  it('should provide result from parsing JSON and calling required theme with object as-is', async () => {
    const themed = await transformWithTheme('foo')(
      JSON.stringify({ foo: 'foo', bar: 'bar' })
    );

    expect(themed).toEqual('This is good');

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();
  });
});
