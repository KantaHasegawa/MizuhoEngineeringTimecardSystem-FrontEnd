import useSWR from 'swr';
import useAxios from './useAxios';

export type TypeTimecard = {
  user: string;
  workspot: string;
  attendance: string;
  leave: string;
  workTime: number;
  regularWorkTime: number;
  irregularWorkTime: number;
  rest: number;
};

const useGetLatestTimecard = (user: string) => {
  const axios = useAxios();

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeTimecard>(`timecard/latest/${user}`, fetcher);

  return {
    latestTimecard: data,
    latestTimecardIsError: error,
  };
};

export default useGetLatestTimecard;
