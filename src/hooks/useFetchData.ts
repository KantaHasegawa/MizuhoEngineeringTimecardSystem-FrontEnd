import useSWR from 'swr';
import fetcher from '../lib/fetcher';

function useFetchData<T>(url: string): {
  data: T | undefined;
  error: any;
} {
  const { data, error } = useSWR<T>(url, fetcher);
  return {
    data: data,
    error: error,
  };
}

export default useFetchData;
