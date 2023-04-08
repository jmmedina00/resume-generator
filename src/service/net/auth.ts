export type Authorization = () => string;

export const authorizeWithBearerToken = (token: string) => () =>
  `Bearer ${token}`;
export const authorizeWithBasicCredentials =
  (user: string, password: string) => () =>
    `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
