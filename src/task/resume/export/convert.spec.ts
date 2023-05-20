import { beforeEach } from 'node:test';
import { RenderContext } from '../../context';
import {
  getResumeToDocumentConverter,
  getResumeToPdfConverter,
} from './convert';
import puppeteer from 'puppeteer';

jest.mock('jsonresume-theme-foo', () => ({
  render: jest.fn().mockReturnValue('This is good'),
}));

jest.mock('jsonresume-theme-bar', () => ({
  render: jest.fn().mockReturnValue('This is bad'),
}));

jest.mock('puppeteer', () => {
  const setContent = jest.fn();
  const pdf = jest.fn().mockResolvedValue(Buffer.from('Moñeco'));

  const page = jest.fn().mockResolvedValue({
    setContent,
    pdf,
  });

  const browser = {
    newPage: page,
    close: jest.fn(),
  };

  const launch = jest.fn().mockResolvedValue(browser);
  return { launch, browser, pdf, setContent };
});

describe('Resume to document conversion', () => {
  it('should replace JSON contents with contents provided by theme', async () => {
    const context: RenderContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
    };

    const expectedContext: RenderContext = {
      contents: Buffer.from('This is good'),
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

  it('should replace JSON contents with PDF generated with Puppeteer', async () => {
    const context: RenderContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
    };

    const expectedContext: RenderContext = {
      contents: Buffer.from('Moñeco'),
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
    };

    const converter = getResumeToPdfConverter('foo');
    await converter(context);

    expect(context).toEqual(expectedContext);

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();

    expect(puppeteer.launch).toHaveBeenCalledWith({ headless: 'new' });
    expect((puppeteer as any).browser.newPage).toHaveBeenCalled();
    expect((puppeteer as any).browser.close).toHaveBeenCalled();
    expect((puppeteer as any).setContent).toHaveBeenCalledWith('This is good', {
      waitUntil: 'networkidle0',
    });
    expect((puppeteer as any).pdf).toHaveBeenCalledWith({
      format: 'a4',
      printBackground: true,
    });
  });
});
