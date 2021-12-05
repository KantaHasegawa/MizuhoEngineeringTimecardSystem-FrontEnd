import { CircularProgress } from '@material-ui/core';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import AdminPage from '../components/AdminPage';
import CommonPage from '../components/CommonPage';
import ErrorComponent from '../components/ErrorComponent';
import Layout from '../components/Layout';
import { userInfoState, isUserLoadingState, isLogedInState } from '../components/atoms';
import useCurrentUser from '../hooks/useCurrentUser';

const IndexPage = () => {
  const router = useRouter();
  const isLogedIn = useRecoilValue(isLogedInState);
  const userInfo = useRecoilValue(userInfoState);
  const isUserLoading = useRecoilValue(isUserLoadingState);
  useCurrentUser();

  useEffect(() => {
    if (!isLogedIn) {
      router.push('/auth/login');
    }
  }, [isLogedIn]);

  return (
    <Layout title='ミズホエンジニアリング | ホーム'>
      {isUserLoading ? (
        <CircularProgress />
      ) : !userInfo.role ? (
        <ErrorComponent></ErrorComponent>
      ) : userInfo.role === 'admin' ? (
        <AdminPage></AdminPage>
      ) : (
        <CommonPage user={userInfo}></CommonPage>
      )}
    </Layout>
  );
};

export default IndexPage;
