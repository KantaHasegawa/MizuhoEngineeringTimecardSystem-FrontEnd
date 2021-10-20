import useSWR from 'swr'
import useAxios from './useAxios'

type TypeUser = {
  attendance: string
  password: string
  role: string
  user: string
}

const useUserList = (user: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR<TypeUser>([`user/show/${user}`], fetcher)
  return {
    userShow: data,
    userShowIsError: error
  }
}

export default useUserList;
