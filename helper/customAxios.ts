import axios from 'axios'

const customAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  timeout: 1000,
  withCredentials: true
});

export default customAxios;
