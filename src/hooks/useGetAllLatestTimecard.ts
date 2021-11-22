import useSWR from 'swr';
import axios from '../lib/axiosSetting';

export type TypeTimecard = {
  user: string;
  workspot?: string;
  attendance: string;
  leave?: string;
  workTime?: number;
  regularWorkTime?: number;
  irregularWorkTime?: number;
  rest?: number;
};

export type TypeAllLatestTimecard = {
  alreadyLeaveTimecards: TypeTimecard[];
  notAttendTimecards: TypeTimecard[];
  notLeaveTimecards: TypeTimecard[];
};

const useGetAllLatestTimecard = () => {
  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeAllLatestTimecard>(`timecard/latestall`, fetcher);

  return {
    latestTimecards: data,
    latestTimecardsIsError: error,
  };
};

export default useGetAllLatestTimecard;
