import { addArrow, cleanup } from './md';

describe('Markdown conversion helpers', () => {
  it('should remove trailing commas', () => {
    const renderer = jest.fn().mockReturnValue('foo, bar, fizzbuzz, ');
    const expected = 'foo, bar, fizzbuzz';
    expect(cleanup()('raw', renderer)).toEqual(expected);
  });

  it('should add a thing to list item without <p> tag', () => {
    const renderer = jest.fn().mockReturnValue('foo bar');
    const expectedForTwo = 'foo → bar';
    expect(addArrow()('raw', renderer)).toEqual(expectedForTwo);

    renderer.mockReturnValue('alone');
    expect(addArrow()('raw', renderer)).toEqual('alone');
  });
});
