import { useEffect } from 'react';
import axios from '../lib/axiosSetting';

type Response = {
  csrfToken: string;
};

const useCsrf = () => {
  useEffect(() => {
    const getCsrfToken = async () => {
      const result = await axios.get<Response>(`auth/csrf`);
      localStorage.setItem('csrfToken', result.data.csrfToken);
    };
    getCsrfToken();
  }, []);
};

export default useCsrf;
