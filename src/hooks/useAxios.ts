import axios from 'axios';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { csrfTokenState } from '../components/atoms';

type TypeRefreshResponse = {
  accessToken: string;
};

const useAxios = () => {
  const router = useRouter();
  const csrfToken = useRecoilValue(csrfTokenState);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST,
    timeout: 10000,
    withCredentials: true,
  });
  api.interceptors.request.use((config: any) => {
    const method = config.method.toUpperCase();
    if (method !== 'OPTIONS' && method !== 'GET') {
      config.headers = {
        ...config.headers,
        'X-CSRF-TOKEN': csrfToken,
      };
    }
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.config && error.response && error.response.data.message === 'jwt expired') {
        try {
          await axios.get<TypeRefreshResponse>(`${process.env.NEXT_PUBLIC_API_HOST}auth/refresh`, {
            withCredentials: true,
            headers: { 'X-CSRF-TOKEN': csrfToken },
          });
          return axios.request(error.config);
        } catch (err) {
          router.push('/auth/login');
        }
      }
      return Promise.reject(error);
    },
  );
  return api;
};

export default useAxios;
