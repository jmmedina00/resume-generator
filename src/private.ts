import { parse } from 'yaml';
import { getFileContents } from './service/gdrive';
import { EncryptedData, decryptText } from './util/encrypt';

export const getPrivateVersionGenerator = async () => {
  const fileId = process.env['PRIVATE_FILE_ID'] || '';
  const encrypted: EncryptedData = await getFileContents(fileId);

  const yaml: any[] = parse(decryptText(encrypted));

  return ({ basics: publicBasics, ...resume }: { [key: string]: any }) => {
    const privateBasics = yaml.reduce<object[]>((list, current, index) => {
      const previous = index === 0 ? publicBasics : list[index - 1];
      return [...list, { ...previous, ...current }];
    }, []);

    return privateBasics.map((basics) => ({ ...resume, basics }));
  };
};
