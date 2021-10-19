import useSWR from 'swr'
import useAxios from './useAxios'

const useCheckUserRole = (role: string, accessToken: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data
  }

  const { data, error } = useSWR([`auth/role/${role}`,accessToken], fetcher)
  return {
    user: data,
    isLoading: !error && !data,
    isError: error
  }
}

export default useCheckUserRole;
