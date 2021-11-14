import { CircularProgress } from '@material-ui/core';
import { TextField, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import AdminPage from '../components/AdminPage';
import CommonPage from '../components/CommonPage';
import ErrorComponent from '../components/ErrorComponent';
import Layout from '../components/Layout';
import { accessTokenState } from '../components/atoms';
import useAxios from '../hooks/useAxios';
import useCurrentUser from '../hooks/useCurrentUser';

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
