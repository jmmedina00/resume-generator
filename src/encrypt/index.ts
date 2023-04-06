import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// https://stackoverflow.com/questions/1220751/how-to-choose-an-aes-encryption-mode-cbc-ecb-ctr-ocb-cfb

const ENCRYPTION_ALGORYTHM = 'aes-256-gcm';

export interface EncryptedData {
  initVector: string;
  data: string;
  authTag: string;
}

const getPassword = () => process.env['PRIVATE_PASSWORD'] ?? '';

export const encryptText = (text: string): EncryptedData => {
  const initVector = randomBytes(16);
  const cipher = createCipheriv(
    ENCRYPTION_ALGORYTHM,
    getPassword(),
    initVector
  );

  const updated = cipher.update(text);
  const encrypted = Buffer.concat([updated, cipher.final()]);

  return {
    initVector: initVector.toString('hex'),
    data: encrypted.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
};

export const decryptText = ({ initVector, data, authTag }: EncryptedData) => {
  const iv = Buffer.from(initVector, 'hex');
  const encrypted = Buffer.from(data, 'hex');

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORYTHM,
    Buffer.from(getPassword()),
    iv
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const updated = decipher.update(encrypted);
  const decrypted = Buffer.concat([updated, decipher.final()]);
  return decrypted.toString();
};
