import axios from 'axios';
import { Authorization } from './auth';

export interface RequestData {
  params?: { [key: string]: string };
  body?: any;
  headers?: { [key: string]: string };
}

export type Requester = <T>(
  method: string,
  url: string,
  data?: RequestData
) => Promise<T>;

export const getAuthorizedRequester =
  (auth: Authorization): Requester =>
  async (method, url, { params = {}, body = {}, headers = {} } = {}) =>
    (
      await axios.request({
        method,
        url,
        params,
        data: body,
        headers: { Authorization: auth(), ...headers },
      })
    ).data;
