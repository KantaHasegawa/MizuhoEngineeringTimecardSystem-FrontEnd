import { useEffect, ReactNode } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { isLogedInState, userInfoState } from './atoms';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setIsLogedIn = useSetRecoilState(isLogedInState);
  const userInfo = useRecoilValue(userInfoState);

  useEffect(() => {
    if (userInfo?.name) {
      setIsLogedIn(true);
    } else {
      setIsLogedIn(false);
    }
  }, [userInfo]);

  return <>{children}</>;
};

export default AuthProvider;
