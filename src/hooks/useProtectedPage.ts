import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isLogedInState, userInfoState } from '../components/atoms';

const useProtectedPage = () => {
  const router = useRouter();
  const isLogedIn = useRecoilValue(isLogedInState);
  const userInfo = useRecoilValue(userInfoState);
  useEffect(() => {
    if (!isLogedIn || userInfo.role !== 'admin') {
      router.push('/auth/login');
    }
  }, []);
};

export default useProtectedPage;
