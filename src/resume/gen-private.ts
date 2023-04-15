export const getPrivateVersionGenerator = (privateIterations: object[]) => {
  return ({ basics: publicBasics, ...resume }: { [key: string]: any }) => {
    const privateBasics = privateIterations.reduce<object[]>(
      (list, current, index) => {
        const previous = index === 0 ? publicBasics : list[index - 1];
        return [...list, { ...previous, ...current }];
      },
      []
    );

    return privateBasics.map((basics) => ({ ...resume, basics }));
  };
};
