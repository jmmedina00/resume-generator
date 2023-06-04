const { readFile, writeFile } = require('fs/promises');
const theme = require('.');

(async () => {
  const resume = JSON.parse(await readFile('./resume.json'));
  const html = theme.render(resume);
  await writeFile('./resume.html', html);
})();
