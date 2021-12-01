import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Backdrop,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../../components/ErrorComponent';
import Layout from '../../../components/Layout';
import PermissionErrorComponent from '../../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../../components/atoms';
import useCsrf from '../../../hooks/useCsrf';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useProtectedPage from '../../../hooks/useProtectedPage';
import axios from '../../../lib/axiosSetting';
import serversideAxios from '../../../lib/axiosSettingServerside';

type TypeUser = {
  user: {
    user: string,
    role: string,
    password: string,
    attendance: string
  }
}

type FormData = {
  password: string;
};

export const UserEditPage = ({ user }: { user: string }) => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [serverSideError, setServerSideError] = useState<string>('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const params = {
      password: data.password,
      username: user,
    };
    try {
      await axios.post(`user/edit`, params);
      reset({
        password: '',
      });
      setServerSideError("");
      enqueueSnackbar('パスワードの変更に成功しました', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('パスワードの変更に失敗しました', { variant: 'error' });
      console.log(err.response);
      if (err?.response?.data?.message) {
        setServerSideError(err.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Layout title='ミズホエンジニアリング | パスワード変更'>
        <Box sx={{ paddingTop: '2rem', width: '350px', marginLeft: 'auto', marginRight: 'auto' }}>
          {isUserLoading ? (
            <CircularProgress />
          ) : !userInfo.role ? (
            <ErrorComponent></ErrorComponent>
          ) : userInfo.role !== 'admin' ? (
            <PermissionErrorComponent></PermissionErrorComponent>
          ) : (
            <>
              <Card variant='outlined'>
                <CardContent>
                  <Typography
                    sx={{
                      marginBottom: '12px !important',
                      fontWeight: 'bold !important',
                      fontSize: '1.1rem',
                    }}
                  >
                    {`${user} パスワード変更`}
                  </Typography>
                  <Typography
                    sx={{ marginBottom: '12px !important', fontSize: '0.8rem !important' }}
                    color='text.secondary'
                  >
                    英数字4文字以上のパスワードを入力してください
                  </Typography>
                  <Typography
                    sx={{ marginBottom: '12px !important', fontSize: '0.8rem !important' }}
                    color='#f44336'
                  >
                    {serverSideError}
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='form'>
                      <Box sx={{ marginBottom: '1rem' }}>
                        <Controller
                          name='password'
                          control={control}
                          defaultValue=''
                          rules={{
                            required: true,
                            minLength: 4,
                            maxLength: 15,
                            pattern: { value: /^[0-9a-zA-Z]+$/, message: '' },
                          }}
                          render={({ field }) => (
                            <TextField size='small' fullWidth label='パスワード' {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.password?.type === 'required' && 'パスワードは必須です'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.password?.type === 'minLength' &&
                            'パスワードは4文字以上で入力してください'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.password?.type === 'maxLength' &&
                            'パスワードは15文字以下で入力してください'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.password?.type === 'pattern' &&
                            'パスワードは半角英数字で入力してください'}
                        </Typography>
                      </Box>
                    </div>
                    <Button fullWidth variant='outlined' type='submit'>
                      更新
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Layout>
    </>
  );
};

export default UserEditPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const host =
    process.env.NODE_ENV === 'development'
      ? 'http://backend:4000/api/v1/'
      : process.env.NEXT_PUBLIC_API_HOST;
  const cookie = ctx.req?.headers.cookie;
  const { id } = ctx.query;
  console.log(host);

  if (!id || Array.isArray(id)) {
    return {
      notFound: true
    };
  }

  const result = await serversideAxios.get<TypeUser>(`${host}user/show?name=${encodeURI(id)}`, { headers: { cookie: cookie! } });
  if (!result?.data?.user?.user) {
    return {
      notFound: true
    };
  }
  return { props: { user: result.data.user.user } };
};
