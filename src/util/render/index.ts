const BODY_REGEX = /(.+)?(\<body\>)(.+)?(\<\/body\>)(.+)?/s;

export const addAtBodyTop = (document: string, snip: string): string => {
  const regexResult = BODY_REGEX.exec(document);
  const [_, ...matches] = regexResult || [];

  matches.splice(2, 0, snip);
  return matches.join('');
};

export const addAtBodyBottom = (document: string, snip: string): string => {
  const regexResult = BODY_REGEX.exec(document);
  const [_, ...matches] = regexResult || [];

  matches.splice(3, 0, snip);
  return matches.join('');
};

export const addStyles = (document: string, css: string): string => {
  const regexResult = /(.+)?(\<head\>)(.+)?(\<\/head\>)(.+)?/s.exec(document);
  const [_, ...matches] = regexResult || [];

  matches.splice(3, 0, '<style>' + css + '</style>');
  return matches.join('');
};
