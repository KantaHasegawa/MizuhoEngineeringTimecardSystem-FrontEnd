import useSWR from 'swr'
import useAxios from './useAxios'

type TypeWorkspot = {
  workspot: string,
}

type TypeWorkspotAndDelete = {
  workspot: string
}

type TypeUserRelationIndexNameOnlyResponse = {
  workspots: TypeWorkspot[],
  workspotsAndDelete: TypeWorkspotAndDelete[]
}

const useUserRelationListNameOnly = (user: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR<TypeUserRelationIndexNameOnlyResponse>(`user/relation/indexnameonly/${user}`, fetcher)
  console.log(data)
  return {
    userRelationResponse: data,
    userRelationResponseIsError: error
  }
}

export default useUserRelationListNameOnly;
