import { CircularProgress } from '@material-ui/core';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import AdminPage from '../components/AdminPage';
import CommonPage from '../components/CommonPage';
import ErrorComponent from '../components/ErrorComponent';
import Layout from '../components/Layout';
import { accessTokenState } from '../components/atoms';
import useCurrentUser from '../hooks/useCurrentUser';

const IndexPage = () => {
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if (!currentUserIsLoading && !currentUser) router.push('/auth/login');

  return (
    <Layout title='ミズホエンジニアリング | ホーム'>
      {currentUserIsLoading ? (
        <CircularProgress />
      ) : currentUserIsError ? (
        <ErrorComponent></ErrorComponent>
      ) : currentUser.role === 'admin' ? (
        <AdminPage></AdminPage>
      ) : (
        <CommonPage user={currentUser}></CommonPage>
      )}
    </Layout>
  );
};

export default IndexPage;
