export const addAtBodyTop = (document: string, snip: string): string => {
  const foo = /(.+)?(\<body\>)(.+)?(\<\/body\>)(.+)?/s.exec(document);
  const [_, ...matches] = foo || [];

  matches.splice(2, 0, snip);
  return matches.join('');
};
