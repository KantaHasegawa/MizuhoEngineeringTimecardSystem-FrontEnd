import useSWR from 'swr';
import useAxios from './useAxios';

export type TypeUserRelation = {
  workspot: string;
  user: string;
  attendance: string;
  latitude: number;
  longitude: number;
};

type TypeUserRelationList = {
  params: TypeUserRelation[];
};

const useUserRelationList = (user: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeUserRelationList>(`relation/user/${user}`, fetcher);
  return {
    userRelationList: data,
    userRelationListIsError: error,
  };
};

export default useUserRelationList;
