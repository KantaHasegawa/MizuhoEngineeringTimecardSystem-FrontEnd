import {
  TextField,
  Button,
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState, useSetRecoilState } from 'recoil';
import mizuhoLogo from '../../../public/mizuho-logo.png';
import { accessTokenState, refreshState } from '../../components/atoms';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser';

type FormData = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const axios = useAxios();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [serverSideError, setServerSideError] = useState<string>('');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const { currentUser, currentUserIsLoading } = useCurrentUser(accessToken);
  if (!refresh && currentUser) router.push('/');
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result: any = await axios.post(`auth/login`, data);
      setAccessToken(result.data.accessToken);
      setRefresh(false);
      router.push('/');
      enqueueSnackbar('ログインしました', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('ログインに失敗しました', { variant: 'error' });
      if (err?.response?.data?.messege) {
        setServerSideError(err.response.data.message);
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
      <Head>
        <title>ミズホエンジニアリング | ログイン</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Container maxWidth='sm'>
        <Box sx={{ paddingTop: '2rem', width: '350px', marginLeft: 'auto', marginRight: 'auto' }}>
          {currentUserIsLoading ? (
            <CircularProgress />
          ) : !refreshState && currentUser ? (
            <Box
              color='white'
              sx={{
                textAlign: 'center',
                backgroundColor: '#9DDDFB',
                padding: '2rem',
                borderRadius: '50px',
              }}
            >
              <Typography>既にログイン済みです</Typography>
              <Typography>数秒後にページが切り替わります</Typography>
            </Box>
          ) : (
            <>
              <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                <Image
                  src={mizuhoLogo}
                  alt='ミズホエンジニアリング'
                  width={100}
                  height={66}
                ></Image>
              </div>
              <Box>
                <Card variant='outlined'>
                  <CardContent>
                    <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 'bold' }}>
                      ログイン
                    </Typography>
                    <Typography sx={{ mb: 1.5, fontSize: '0.8rem' }} color='text.secondary'>
                      氏名とパスワードを入力してください
                    </Typography>
                    <Typography sx={{ mb: 1.5, fontSize: '0.8rem' }} color='#f44336'>
                      {serverSideError}
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className='form'>
                        <Box sx={{marginBottom: "1rem"}}>
                          <Controller
                            name='username'
                            control={control}
                            defaultValue=''
                            rules={{
                              required: true,
                              pattern: { value: /^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]*$/, message: '' },
                            }}
                            render={({ field }) => (
                              <TextField size='small' fullWidth label='氏名' {...field} />
                            )}
                          />
                          <Typography sx={{ fontSize: '0.8rem' }} color='#f44336'>
                            {errors.username?.type === 'required' && '氏名は必須です'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem' }} color='#f44336'>
                            {errors.username?.type === 'pattern' &&
                              '氏名は日本語で入力してください'}
                          </Typography>
                        </Box>
                      </div>
                      <div className='form'>
                        <Box sx={{marginBottom: "1rem"}}>
                          <Controller
                            name='password'
                            control={control}
                            defaultValue=''
                            rules={{
                              required: true,
                              pattern: { value: /^[0-9a-zA-Z]+$/, message: '' },
                            }}
                            render={({ field }) => (
                              <TextField size='small' fullWidth label='パスワード' {...field} />
                            )}
                          />
                          <Typography sx={{ fontSize: '0.8rem' }} color='#f44336'>
                            {errors.password?.type === 'required' && 'パスワードは必須です'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem' }} color='#f44336'>
                            {errors.password?.type === 'pattern' &&
                              'パスワードは半角英数字で入力してください'}
                          </Typography>
                        </Box>
                      </div>
                      <Button fullWidth variant='outlined' type='submit'>
                        進む
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;
