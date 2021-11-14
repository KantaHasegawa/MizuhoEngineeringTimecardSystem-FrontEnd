import useSWR from 'swr';
import useAxios from './useAxios';

type TypeCurrentUser = {
  name: string,
  role: string
}

const useCurrentUser = (accessToken: string) => {
  const axios = useAxios(); //カスタマイズした設定のaxiosインスタンスを取得

  const fetcher = async (url: string): Promise<any> => {
    const res = await axios.get(url);
    return res.data;
  };

  const { data, error } = useSWR(["auth/currentuser", accessToken], fetcher);
  return {
    currentUser: data,
    currentUserIsLoading: !error && !data,
    currentUserIsError: error
  };
};

export default useCurrentUser;
