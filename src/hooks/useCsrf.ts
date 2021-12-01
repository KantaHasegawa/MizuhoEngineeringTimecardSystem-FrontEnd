import useSWR from 'swr';
import fetcher from '../lib/fetcher';

type Response = {
  csrfToken: string;
};

function useCsrfSWR() {
  const { data } = useSWR<Response>(`auth/csrf`, fetcher);
  if (data) {
    localStorage.setItem('csrfToken', data.csrfToken);
  }
}

export default useCsrfSWR;
