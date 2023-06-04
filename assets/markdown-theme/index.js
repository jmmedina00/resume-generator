const { readFileSync } = require('fs');
const { marked } = require('marked');
const { render } = require('mustache');
const { JSDOM } = require('jsdom');
const { join } = require('path');

const item = (text = '') =>
  `<li>${text.trim().replace(/<p>(.+)<\/p>/, '$1')}</li>`;

const renderer = {
  listitem: item,
};

const splitAndRejoin =
  (splitter, joiner) =>
  (text = '', render = () => '') =>
    render(text)
      .trim()
      .split(splitter)
      .filter((a) => !!a)
      .join(joiner);

const addArrow = () => splitAndRejoin(' ', ' → ');
const cleanup = () => splitAndRejoin(/, ?/, ', ');

const getSections = (nodeList = [], header = 'h1') => {
  const sections = {};

  for (const [i, node] of nodeList.entries()) {
    if (node.localName === header) {
      sections[i] = [node];
    } else {
      const latestIndex = [...Object.keys(sections)].pop();
      if (!latestIndex) continue;
      sections[latestIndex].push(node);
    }
  }

  return sections;
};

exports.render = (resume) => {
  const htmlTemplate = readFileSync(
    join(__dirname, './template.html'),
    'utf-8'
  );
  const mdTemplate = readFileSync(join(__dirname, './template.md'), 'utf-8');

  const generatedMarkdown = render(mdTemplate, {
    ...resume,
    cleanup,
    addArrow,
  });

  marked.setOptions({ extensions: [] });
  marked.use({ renderer }, { mangle: false, headerIds: false });
  const contents = marked.parse(generatedMarkdown);
  const dom = new JSDOM(contents);
  const nodes = [...dom.window.document.body.children];

  const sections = getSections(nodes, 'h1');

  const furtherDividedSections = Object.entries(sections).map(
    ([key, list]) => ({ list, subsections: getSections(list, 'h2') })
  );

  const sectionNodes = furtherDividedSections.map(
    ({ list = [], subsections = {} }) => {
      const section = dom.window.document.createElement('section');
      const articles = Object.entries(subsections).map(([_, subList]) => {
        const article = dom.window.document.createElement('article');

        for (const node of subList) {
          const cloned = node.cloneNode(true);
          article.appendChild(cloned);
        }

        return article;
      });

      const strayNodes = list
        .filter(
          (_, index) =>
            index < (Object.keys(subsections)[0] || Number.MAX_VALUE)
        )
        .map((node) => node.cloneNode(true));

      const [one, two, ...rest] = [...strayNodes, ...articles];
      const breakMeNot = dom.window.document.createElement('div');
      breakMeNot.classList.add('break-me-not');
      breakMeNot.appendChild(one);
      breakMeNot.appendChild(two);

      const finalList = [breakMeNot, ...rest];

      for (const node of finalList) {
        section.appendChild(node);
      }

      return section;
    }
  );

  for (const node of nodes) {
    dom.window.document.body.removeChild(node);
  }

  for (const section of sectionNodes) {
    dom.window.document.body.appendChild(section);
  }

  const html = render(htmlTemplate, {
    contents: dom.window.document.body.innerHTML.trim(),
  });

  return html;
};
