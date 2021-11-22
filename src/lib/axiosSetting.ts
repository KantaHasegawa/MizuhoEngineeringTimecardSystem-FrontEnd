import axios from 'axios';

type TypeRefreshResponse = {
  accessToken: string;
};

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
      'X-CSRF-TOKEN': localStorage.csrfToken,
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
      await axios.get<TypeRefreshResponse>(`${process.env.NEXT_PUBLIC_API_HOST}auth/refresh`, {
        withCredentials: true,
        headers: { 'X-CSRF-TOKEN': localStorage.csrfToken },
      });
      return axios.request(error.config);
    }
    return Promise.reject(error);
  },
);

export default api;
