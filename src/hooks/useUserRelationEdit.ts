import useSWR from 'swr';
import useAxios from './useAxios';

export type TypeUserRelation = {
  workspot: string;
  user: string;
  attendance: string;
  latitude: number;
  longitude: number;
};

export type TypeSelectBoxItme = {
  value: string;
  label: string;
};

type TypeUserSelectBoxResponse = {
  selectBoxItems: TypeSelectBoxItme[];
  relations: TypeUserRelation[];
};

const useUserRelationEdit = (user: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeUserSelectBoxResponse>(
    `relation/user/selectbox/${user}`,
    fetcher,
  );
  return {
    userSelectBoxResponse: data,
    userSelectBoxResponseIsError: error,
  };
};

export default useUserRelationEdit;
