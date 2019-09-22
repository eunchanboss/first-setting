/* eslint-disable no-else-return */
import axios from 'axios';
import { setToken, getToken } from './auth';

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://dev.storyjam.co.kr' : 'https://dev.storyjam.co.kr:9030';

export const axiosInstace = axios.create({
  baseURL: `${baseUrl}/front`,
  headers: { 'content-Type': 'application/json' },
});


const requestHandler = (request) => {
  const token = getToken();
  if (token) {
    request.headers.authorization = token;
  }
  return request;
};

axiosInstace.interceptors.request.use(
  request => requestHandler(request),
  error => Promise.reject(error),
);

/* 시스템에러, 네트웤 에러 */
const errorHandler = error => Promise.reject(error);

/* 토큰 저장 */
const successHandler = (response) => {
  const { data, headers } = response;
  if (data.result.code !== '000') {
    console.log(`REST Eerror- url:${response.config.url}, code:${data.result.code}, message:${data.result.message}`);
    throw data;
  // eslint-disable-next-line no-else-return
  } else {
    // 인증 토큰 저장
    const tokenValue = getToken();
    if (tokenValue === undefined && tokenValue === '') {
      setToken(headers.authorization);
    } else if (tokenValue !== headers.authorization && headers.authorization !== undefined && headers.authorization !== '') {
      setToken(headers.authorization);
    }
 
    return data;
  }
};

axiosInstace.interceptors.response.use(
  response => successHandler(response, 'saga'),
  error => errorHandler(error),
);

export const getAxiosResult = async (type, url, paramdata) => {
  try {
    if (type === 'POST') {
      const req = await axiosInstace.post(url, paramdata);
      return req;
    } else if (type === 'GET') {
      const req = await axiosInstace.get(url + paramdata);
      return req;
    } else if (type === 'PATCH') {
      const req = await axiosInstace.patch(url, paramdata);
      return req;
    } else if (type === 'PUT') {
      const req = await axiosInstace.put(url, paramdata);
      return req;
    } else if (type === 'DELETE') {
      const req = await axiosInstace.delete(url, paramdata);
      return req;
    }
  } catch (error) {
    return error;
  }
};
