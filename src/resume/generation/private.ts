const appendValuesToObject = (basics: any, append: any) => {
  if (!!Object.values(append).find((value) => value instanceof Object))
    throw new Error('No complex objects to be appended');

  const set = new Set([...Object.keys(basics), ...Object.keys(append)]);

  const entries: [key: string, value: any][] = [...set].map((key) => {
    const basicValue = basics[key];
    const appendValue = append[key];

    if (!appendValue) return [key, basicValue];
    if (!basicValue) return [key, appendValue];

    if (basicValue instanceof Object && !!appendValue)
      throw new Error('Cannot append to object');

    return [key, basicValue + appendValue];
  });

  return Object.fromEntries(entries);
};

export const getPrivateVersionGenerator = (privateIterations: any[]) => {
  return ({ basics: publicBasics, ...resume }: { [key: string]: any }) => {
    const privateBasics = privateIterations.reduce<object[]>(
      (list, { append, ...current }, index) => {
        const previous = index === 0 ? publicBasics : list[index - 1];
        const currentBasics = { ...previous, ...current };

        return [
          ...list,
          !!append
            ? appendValuesToObject(currentBasics, append)
            : currentBasics,
        ];
      },
      []
    );

    return privateBasics.map((basics) => ({ ...resume, basics }));
  };
};
