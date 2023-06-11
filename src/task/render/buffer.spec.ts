import type { ListrTaskWrapper } from 'listr2';
import type { RenderContext } from '../context';
import {
  bufferContextResource,
  bufferContextResourceAsIs,
  bufferContextResourceAsPdf,
} from './buffer';
import puppeteer from 'puppeteer';

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
jest.mock('../io/task');

describe('Rendering result buffering', () => {
  it('should provide a task yielder given bufferer and context resource key', () => {
    const bufferer = jest.fn().mockReturnValue('Buffer');

    const expectedTasks = [{ title: 'Apply bufferer', task: 'Buffer' }];
    const tasks = bufferContextResource(
      bufferer,
      'foo'
    )({} as ListrTaskWrapper<any, any>);
    expect(tasks).toEqual(expectedTasks);
    expect(bufferer).toHaveBeenCalledWith('foo');
  });

  it('should buffer a resource as is into context contents', async () => {
    const context: RenderContext = {
      path: '',
      resources: { toWrite: 'Please write me' },
      contents: Buffer.of(),
    };

    const expectedFinalContext: RenderContext = {
      path: '',
      resources: { toWrite: 'Please write me' },
      contents: Buffer.from('Please write me'),
    };

    const task = bufferContextResourceAsIs('toWrite');
    await task(context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should buffer a resource transformed into PDF with the help of Puppeteer', async () => {
    const context: RenderContext = {
      path: '',
      resources: { toWrite: 'Please write me' },
      contents: Buffer.of(),
    };

    const expectedFinalContext: RenderContext = {
      path: '',
      resources: { toWrite: 'Please write me' },
      contents: Buffer.from('Moñeco'),
    };

    const task = bufferContextResourceAsPdf('toWrite');
    await task(context);
    expect(context).toEqual(expectedFinalContext);

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    expect((puppeteer as any).browser.newPage).toHaveBeenCalled();
    expect((puppeteer as any).browser.close).toHaveBeenCalled();
    expect((puppeteer as any).setContent).toHaveBeenCalledWith(
      'Please write me',
      {
        waitUntil: 'networkidle0',
      }
    );
    expect((puppeteer as any).pdf).toHaveBeenCalledWith({
      format: 'a4',
      printBackground: true,
    });
  });
});
