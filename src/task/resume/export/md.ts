const splitAndRejoin =
  (splitter: string | RegExp, joiner: string) =>
  (text: string, render: (text: string) => string) =>
    render(text)
      .trim()
      .split(splitter)
      .filter((a) => !!a)
      .join(joiner);

export const addArrow = () => splitAndRejoin(' ', ' → ');
export const cleanup = () => splitAndRejoin(/, ?/, ', ');
