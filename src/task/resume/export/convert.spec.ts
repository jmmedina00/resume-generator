import {
  RenderContext,
  RenderWithTemplateContext,
  ResumeContext,
  initialContext,
} from '../../context';
import {
  getResumeToDocumentConverter,
  getResumeToFilledTemplateConverter,
  getResumeToPdfConverter,
} from './convert';
import puppeteer from 'puppeteer';
import { getNavigationBar } from '../../../resume/generation/public';
import { addAtBodyBottom, addAtBodyTop, addStyles } from '../../../util/render';
import { LocalisedObject } from '../../../mapping/locale.types';
import { render } from 'mustache';
import { readFile } from 'fs/promises';
import { getPagesLinkFromRepo } from '../../../service/github/util';

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

jest.mock('../../../service/github/util');
jest.mock('../../../resume/generation/public');
jest.mock('../../../util/render');
jest.mock('fs/promises');
jest.mock('mustache');

describe('Resume to document conversion', () => {
  it('should replace JSON contents with rendered template from mustache', async () => {
    (render as jest.Mock).mockReturnValue('Rendered');
    (readFile as jest.Mock).mockReturnValue('Template');

    const context: RenderContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
    };

    const expectedContext = {
      contents: Buffer.from('Rendered'),
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
    };

    const task = getResumeToFilledTemplateConverter('./template.txt');
    await task(context);

    expect(context).toEqual(expectedContext);
    expect(readFile).toHaveBeenCalledWith('./template.txt', 'utf-8');
    expect(render).toHaveBeenCalledWith('Template', { foo: 'foo', bar: 'bar' });
  });

  it('should replace JSON contents with contents provided by theme and navbar snip', async () => {
    (getNavigationBar as jest.Mock).mockReturnValue('Navigation bar');
    (addAtBodyTop as jest.Mock).mockImplementation((foo, bar) =>
      [foo, bar].join(' - ')
    );
    (addStyles as jest.Mock).mockImplementation(
      (foo, bar) => foo + ', styled with ' + bar
    );

    const localised: LocalisedObject = {
      flattened: { re: 'foo' },
      locales: { en: { re: 'bar' }, es: { re: 'baz' } },
    };

    const resumeContext: ResumeContext = {
      ...initialContext,
      localised,
    };

    const context: RenderWithTemplateContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
      activePage: 're',
      templateContents: 'qwerty',
      templateStyles: 'la',
    };

    const expectedContext: RenderWithTemplateContext = {
      contents: Buffer.from('This is good - Navigation bar, styled with la'),
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
      activePage: 're',
      templateContents: 'qwerty',
      templateStyles: 'la',
    };

    const converter = getResumeToDocumentConverter('foo', resumeContext);
    await converter(context);

    expect(context).toEqual(expectedContext);

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();

    expect(getNavigationBar).toHaveBeenCalledWith(
      'qwerty',
      { ...localised },
      're'
    );

    expect(addAtBodyTop).toHaveBeenCalledWith('This is good', 'Navigation bar');
    expect(addStyles).toHaveBeenCalledWith(
      'This is good - Navigation bar',
      'la'
    );
  });

  it('should replace JSON contents with PDF with footer generated with Puppeteer', async () => {
    process.env['GITHUB_REPOSITORY'] = 'repo_from_actions_here';
    (render as jest.Mock).mockReturnValue('Thingy');
    (getPagesLinkFromRepo as jest.Mock).mockReturnValue('mylink');
    (addAtBodyBottom as jest.Mock).mockReturnValue('Bottomed');
    (addStyles as jest.Mock).mockReturnValue('Stylish');

    const context: RenderWithTemplateContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
      activePage: '',
      templateContents: 'template',
      templateStyles: 'styles',
    };

    const expectedContext: RenderWithTemplateContext = {
      contents: Buffer.from('Moñeco'),
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
      activePage: '',
      templateContents: 'template',
      templateStyles: 'styles',
    };

    const converter = getResumeToPdfConverter('foo');
    await converter(context);

    expect(context).toEqual(expectedContext);

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();

    expect(getPagesLinkFromRepo).toHaveBeenCalledWith('repo_from_actions_here');
    expect(render).toHaveBeenCalledWith('template', { resumeLink: 'mylink' });
    expect(addAtBodyBottom).toHaveBeenCalledWith('This is good', 'Thingy');
    expect(addStyles).toHaveBeenCalledWith('Bottomed', 'styles');

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    expect((puppeteer as any).browser.newPage).toHaveBeenCalled();
    expect((puppeteer as any).browser.close).toHaveBeenCalled();
    expect((puppeteer as any).setContent).toHaveBeenCalledWith('Stylish', {
      waitUntil: 'networkidle0',
    });
    expect((puppeteer as any).pdf).toHaveBeenCalledWith({
      format: 'a4',
      printBackground: true,
    });
  });

  it('should replace JSON contents with PDF with no footer generated with Puppeteer', async () => {
    process.env['GITHUB_REPOSITORY'] = '';
    (render as jest.Mock).mockClear().mockReturnValue('BAd thing');
    (getPagesLinkFromRepo as jest.Mock).mockReturnValue('');
    (addAtBodyBottom as jest.Mock).mockReturnValue('Bottomed');
    (addStyles as jest.Mock).mockReturnValue('Stylish');

    const context: RenderWithTemplateContext = {
      contents: Buffer.from(JSON.stringify({ foo: 'foo', bar: 'bar' })),
      path: '',
      prettierOptions: {},
      preprocessFn: jest.fn(), //This is where this feat would go
      activePage: '',
      templateContents: 'template',
      templateStyles: 'styles',
    };

    const expectedContext: RenderWithTemplateContext = {
      contents: Buffer.from('Moñeco'),
      path: '',
      prettierOptions: {},
      preprocessFn: expect.anything(),
      activePage: '',
      templateContents: 'template',
      templateStyles: 'styles',
    };

    const converter = getResumeToPdfConverter('foo');
    await converter(context);

    expect(context).toEqual(expectedContext);

    const moduleFoo = require('jsonresume-theme-foo');
    const moduleBar = require('jsonresume-theme-bar');

    expect(moduleFoo.render).toHaveBeenCalledWith({ foo: 'foo', bar: 'bar' });
    expect(moduleBar.render).not.toHaveBeenCalled();

    expect(getPagesLinkFromRepo).toHaveBeenCalledWith('');
    expect(render).not.toHaveBeenCalled();
    expect(addAtBodyBottom).toHaveBeenCalledWith('This is good', '');
    expect(addStyles).toHaveBeenCalledWith('Bottomed', 'styles');

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    expect((puppeteer as any).browser.newPage).toHaveBeenCalled();
    expect((puppeteer as any).browser.close).toHaveBeenCalled();
    expect((puppeteer as any).setContent).toHaveBeenCalledWith('Stylish', {
      waitUntil: 'networkidle0',
    });
    expect((puppeteer as any).pdf).toHaveBeenCalledWith({
      format: 'a4',
      printBackground: true,
    });
  });
});
