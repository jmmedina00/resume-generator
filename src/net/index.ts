import axios from 'axios';
import { Authorization } from './auth';

export interface Requester {
  [key: string]: <T>(url: string, data?: any, headers?: any) => Promise<T>;
}

export const getAuthorizedRequester = (auth: Authorization): Requester => ({
  get: async <T>(url: string, data: any = {}, headers?: any) =>
    (
      await axios.get<T>(url, {
        params: data,
        headers: { Authorization: auth(), ...headers },
      })
    ).data,
  post: async <T>(url: string, data: any = {}, headers?: any) =>
    (
      await axios.post<T>(url, data, {
        headers: { Authorization: auth(), ...headers },
      })
    ).data,
});
