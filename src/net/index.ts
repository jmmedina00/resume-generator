import axios from 'axios';
import { Authorization } from './auth';

export interface Requester {
  [key: string]: <T>(url: string, data?: any) => Promise<T>;
}

const getAuthorizedHeaders = (auth: Authorization): any => {
  const authString = auth();
  return !!authString ? { Authorization: authString } : {};
};

export const getAuthorizedRequester = (auth: Authorization): Requester => ({
  get: async <T>(url: string, data: any = {}) => {
    return (
      await axios.get<T>(url, {
        params: data,
        headers: getAuthorizedHeaders(auth),
      })
    ).data;
  },
  post: async <T>(url: string, data: any = {}) => {
    return (
      await axios.post<T>(url, data, { headers: getAuthorizedHeaders(auth) })
    ).data;
  },
});
