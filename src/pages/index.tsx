import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AdminPage from '../components/AdminPage';
import CommonPage from '../components/CommonPage';
import { Controller, useForm } from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import { useState } from 'react';
import useAxios from '../hooks/useAxios';
import useCurrentUser from '../hooks/useCurrentUser';
import { useRecoilValue } from 'recoil';
import { accessTokenState } from '../components/atoms';
import { CircularProgress } from '@material-ui/core';
import ErrorComponent from '../components/ErrorComponent';

const SignUpPage = () => {
  const axios = useAxios();
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

export default SignUpPage;
