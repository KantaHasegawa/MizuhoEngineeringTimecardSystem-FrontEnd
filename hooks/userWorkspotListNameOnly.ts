import useSWR from 'swr'
import useAxios from './useAxios'

type TypeWorkspot = {
  workspot: string
}

type TypeWorkspotList = {
  params: TypeWorkspot[]
}

const useWorkspotListNameOnly = () => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR<TypeWorkspotList>("workspot/indexnameonly", fetcher)
  return {
    workspotList: data,
    workspotListIsError: error
  }
}

export default useWorkspotListNameOnly;
