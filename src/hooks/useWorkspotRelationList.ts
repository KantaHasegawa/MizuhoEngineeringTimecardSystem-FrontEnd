import useSWR from 'swr';
import useAxios from './useAxios';

export type TypeWorkspotRelation = {
  attendance: string;
  password: string;
  role: string;
  user: string;
};

type TypeWorkspotRelationList = {
  params: TypeWorkspotRelation[];
};

const useWorkspotRelationList = (workspot: string) => {
  const axios = useAxios();

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeWorkspotRelationList>(
    `relation/workspot/${workspot}`,
    fetcher,
  );
  return {
    workspotRelationList: data,
    workspotRelationListIsError: error,
  };
};

export default useWorkspotRelationList;
