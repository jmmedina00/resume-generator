import { Options, resolveConfig } from 'prettier';
import { RenderContext, ResumeContext, initialContext } from '../../context';
import {
  PATH_MARKDOWN_TEMPLATE,
  PATH_STYLES,
  PATH_NAVBAR_TEMPLATE,
  THEME_HTML,
  THEME_PDF,
  getHtmlRender,
  getJsonRender,
  getMarkdownRender,
  getPdfRender,
  getPrettierOptions,
  validateResumeWithSchema,
  PATH_FOOTER_TEMPLATE,
} from './config';
import {
  getResumeToDocumentConverter,
  getResumeToFilledTemplateConverter,
  getResumeToPdfConverter,
} from './convert';
import { readFile } from 'fs/promises';

jest.mock('./convert');
jest.mock('fs/promises');
jest.mock('prettier');
jest.mock('resume-schema', () => ({
  // Successful callback function, turned into promise by promisify
  validate: jest
    .fn()
    .mockImplementation((value, callback: Function) =>
      callback(null, `${value} is valid`)
    ),
}));

describe('Resume rendering config', () => {
  it('should provide Prettier options from lib as-is', async () => {
    const options: Options = { trailingComma: 'es5' };
    (resolveConfig as unknown as jest.Mock).mockResolvedValue(options);

    const actualOptions = await getPrettierOptions();
    expect(actualOptions).toEqual(options);
  });

  it('should parse resume and validate it against schema', async () => {
    const object = { foo: 'nar', bar: 'baz' };

    const context: RenderContext = {
      path: 'foo/bar',
      contents: Buffer.from(JSON.stringify(object)),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    await validateResumeWithSchema(context);

    const schema = require('resume-schema');
    expect(schema.validate).toHaveBeenCalledWith(
      { ...object },
      expect.anything()
    );
  });

  it('should provide JSON renderer from Prettier options', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };

    const render = await getJsonRender(prettierOptions);
    expect(render).toEqual({
      prettierOptions,
      preprocessFn: expect.anything(),
    });
  });

  it('should provide PDF renderer without any Prettier options and with specific processor', async () => {
    (getResumeToPdfConverter as jest.Mock).mockImplementation((theme) => ({
      theme,
    }));
    (readFile as jest.Mock).mockImplementation(async (file) => file);

    const render = await getPdfRender();
    expect(render).toEqual({
      prettierOptions: null,
      preprocessFn: { theme: THEME_PDF },
      templateContents: PATH_FOOTER_TEMPLATE,
      templateStyles: PATH_STYLES,
    });
  });

  it('should provide Markdown renderer with appended Prettier options and specific processor', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };
    (getResumeToFilledTemplateConverter as jest.Mock).mockImplementation(
      (template) => ({ template })
    );

    const render = await getMarkdownRender(prettierOptions);
    expect(render).toEqual({
      prettierOptions: { ...prettierOptions, parser: 'markdown' },
      preprocessFn: { template: PATH_MARKDOWN_TEMPLATE },
    });
  });

  it('should provide HTML renderer with appended Prettier options, loaded files and processor with context', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };
    const resumeContext: ResumeContext = { ...initialContext };

    (readFile as jest.Mock).mockImplementation((path) => {
      if (path === PATH_STYLES) return 'styles';
      if (path === PATH_NAVBAR_TEMPLATE) return 'template';
      return '';
    });
    (getResumeToDocumentConverter as jest.Mock).mockImplementation(
      (theme, context) => ({ theme, context })
    );

    const render = await getHtmlRender(prettierOptions, resumeContext);
    expect(render).toEqual({
      templateContents: 'template',
      templateStyles: 'styles',
      prettierOptions: { ...prettierOptions, parser: 'html' },
      preprocessFn: { theme: THEME_HTML, context: resumeContext },
    });
  });
});
