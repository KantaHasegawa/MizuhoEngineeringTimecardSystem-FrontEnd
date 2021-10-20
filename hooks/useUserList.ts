import useSWR from 'swr'
import useAxios from './useAxios'

type TypeUser = {
  attendance: string
  password: string
  role: string
  user: string
}

type TypeUserList = {
  users: TypeUser[]
}

const useCurrentUser = () => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR<TypeUserList>(["user/index"], fetcher)
  console.log(data)
  return {
    userList: data,
    userListIsError: error
  }
}

export default useCurrentUser;
