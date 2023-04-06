import { JSDOM } from 'jsdom';

export const addAtBodyTop = (document: string, snip: string): string => {
  const dom = new JSDOM(document);

  const body = dom.window.document.body;
  body.insertAdjacentHTML('afterbegin', snip);

  return dom.serialize();
};
