import axios from 'axios';

type TypeRefreshResponse = {
  accessToken: string;
};

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://backend:4000/api/v1/'
    : process.env.NEXT_PUBLIC_API_HOST;

const api = axios.create({
  baseURL: host,
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config: any) => {
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.config && error.response && error.response.data.message === 'jwt expired') {
      await axios.get<TypeRefreshResponse>(`${host}auth/refresh`, {
        withCredentials: true,
      });
      return axios.request(error.config);
    }
    return Promise.reject(error);
  },
);

export default api;
