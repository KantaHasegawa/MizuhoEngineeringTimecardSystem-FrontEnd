import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Typography,
  Backdrop,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';
import axios from '../../lib/axiosSetting';

type FormData = {
  username: string;
  password: string;
};

const SignUpPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const userInfo = useRecoilValue(userInfoState);
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const [serverSideError, setServerSideError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useCurrentUser();
  useProtectedPage();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await axios.post(`user/signup`, data);
      reset({
        username: '',
        password: '',
      });
      enqueueSnackbar('登録に成功しました', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('登録に失敗しました', { variant: 'error' });
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
      <Layout title='ミズホエンジニアリング | 社員登録'>
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
                    variant='h5'
                    sx={{ marginBottom: '12px !important', fontWeight: 'bold !important' }}
                  >
                    社員登録
                  </Typography>
                  <Typography
                    sx={{ marginBottom: '12px !important', fontSize: '0.8rem !important' }}
                    color='text.secondary'
                  >
                    氏名と英数字4文字以上のパスワードを入力してください
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
                          name='username'
                          control={control}
                          defaultValue=''
                          rules={{
                            required: true,
                            pattern: { value: /^[ぁ-んァ-ヶーｱ-ﾝﾞﾟ一-龠]*$/, message: '' },
                          }}
                          render={({ field }) => (
                            <TextField size='small' fullWidth label='氏名' {...field} />
                          )}
                        />
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.username?.type === 'required' && '氏名は必須です'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem !important' }} color='#f44336'>
                          {errors.username?.type === 'pattern' && '氏名は日本語で入力してください'}
                        </Typography>
                      </Box>
                    </div>

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
                      登録
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

export default SignUpPage;
