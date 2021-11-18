import axios from 'axios';
import { useRouter } from 'next/router';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { accessTokenState, refreshState } from '../components/atoms';

type TypeRefreshResponse = {
  accessToken: string;
}

const useAxios = () => {
  const router = useRouter();
  const setRefresh = useSetRecoilState(refreshState);
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST,
    timeout: 10000,
    withCredentials: true,
  });
  api.interceptors.request.use((config: any) => {
    config.headers.common['Authorization'] = 'Bearer ' + accessToken;
    return config;
  });
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.config && error.response && error.response.data.message === 'jwt expired') {
        try {
          const result = await axios.get<TypeRefreshResponse>(`${process.env.NEXT_PUBLIC_API_HOST}auth/refresh`, {withCredentials: true});
          setAccessToken(result.data.accessToken);
          const config = error.config;
          config.headers['Authorization'] = 'Bearer ' + result.data.accessToken;
          return axios.request(error.config);
        } catch (err) {
          setRefresh(true);
          router.push('/auth/login');
        }
      }
      return Promise.reject(error);
    },
  );
  return api;
};

export default useAxios;
