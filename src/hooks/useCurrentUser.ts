import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { userInfoState, isUserLoadingState } from '../components/atoms';
import axios from '../lib/axiosSetting';

type TypeCurrentUser = {
  name: string;
  role: string;
};

const useCurrentUser = () => {
  const setUserInfo = useSetRecoilState(userInfoState);
  const setIsUserLoading = useSetRecoilState(isUserLoadingState);
  useEffect(() => {
    const getCurrentUser = async () => {
      setIsUserLoading(true);
      try {
        const result = await axios.get<TypeCurrentUser>('auth/currentuser');
        setUserInfo(result.data);
      } catch (err) {
        setUserInfo({ name: '', role: '' });
      } finally {
        setIsUserLoading(false);
      }
    };
    getCurrentUser();
  }, []);
};

export default useCurrentUser;
