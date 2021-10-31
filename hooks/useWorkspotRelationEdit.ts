import useSWR from "swr";
import useAxios from "./useAxios";

export type TypeWorkspotRelation = {
  attendance: string;
  password: string;
  role: string;
  user: string;
};

export type TypeSelectBoxItme = {
  value: string;
  label: string;
};

type TypeWorkspotSelectBoxResponse = {
  selectBoxItems: TypeSelectBoxItme[];
  relations: TypeWorkspotRelation[];
};

const useWorkspotRelationEdit = (workspot: string) => {
  const axios = useAxios();

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR<TypeWorkspotSelectBoxResponse>(
    `relation/workspot/selectbox/${workspot}`,
    fetcher
  );
  return {
    workspotSelectBoxResponse: data,
    workspotSelectBoxResponseIsError: error,
  };
};

export default useWorkspotRelationEdit;
