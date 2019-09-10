import axios from 'axios';
import { setToken, getToken } from './auth';


const baseUrl = process.env.NODE_ENV === 'production' ? 'https://dev.storyjam.co.kr' : 'http://localhost:9002';
export const axiosInstance = axios.create({
  baseURL: `${baseUrl}/factory`,
});

const requestHandler = (request) => {
  console.log('request handler:', request);
  // console.log('request handler: ', request.url);
  console.log('request handler: token: ', getToken());
  const token = getToken();
  if (token) {
    request.headers.authorization = token;
  }
  return request;
};

axiosInstance.interceptors.request.use(
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
    throw data.result;
  } else {
    // 인증 토큰 저장
    setToken(headers.authorization);
    return data.data;
  }
};

axiosInstance.interceptors.response.use(
  response => successHandler(response),
  error => errorHandler(error),
);


export const httpHandler = (response) => {
  const { data, status, headers } = response;
  // http status 체크
  if (status > 300) {
    throw new Error(`HTTP Error- status:${status}`);
  }
  // restapi 에러 체크
  if (data.result.code !== '000') {
    throw data.result;
    // throw new Error(`REST Eerror- code:${data.result.code}, message:${data.result.message}`);
  } else {
    // 인증 토큰 저장
    setToken(headers.authorization);
  }
  return data;
};
