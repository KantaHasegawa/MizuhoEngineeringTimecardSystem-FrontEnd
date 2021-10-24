import useSWR from 'swr'
import useAxios from './useAxios'

type TypeWorkspot = {
  user: string,
  attendance: string,
  workspot: string,
  latitude: number,
  longitude: number
}

type TypeWorkspotList = {
  params: TypeWorkspot[]
}

const useWorkspotList = () => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR<TypeWorkspotList>("workspot/index", fetcher)
  return {
    workspotList: data,
    workspotListIsError: error
  }
}

export default useWorkspotList;
