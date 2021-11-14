import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { accessTokenState } from '../../../components/atoms';
import Layout from '../../../components/Layout';
import useCurrentUser from '../../../hooks/useCurrentUser';
import getAllUserIDs from '../../../lib/getAllUserIDs';
import { Controller, useForm } from 'react-hook-form';
import { TextField, Button, CircularProgress, Box, Typography, Card, CardContent, Backdrop } from "@mui/material";
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import useAxios from '../../../hooks/useAxios';
import ErrorComponent from '../../../components/ErrorComponent';

type TypeParams = {
  id: string
}

type FormData = {
  password: string;
};

export const UserEditPage = ({ user }: { user: string }) => {
  const axios = useAxios();
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [serverSideError, setServerSideError] = useState<string>("");
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/");
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const params = {
      password: data.password,
      username: user
    };
    try {
      await axios.post(`user/edit`, params);
      reset({
        password: ""
      });
      enqueueSnackbar("パスワードの変更に成功しました", { variant: "success" });
    } catch (err: any) {
      enqueueSnackbar("パスワードの変更に失敗しました", { variant: "error" });
      console.log(err.response);
      if (err?.response?.data?.message) { setServerSideError(err.response?.data?.message); }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Layout title="ミズホエンジニアリング | パスワード変更">
        <Box sx={{ paddingTop: "2rem", width: "350px", marginLeft: "auto", marginRight: "auto" }}>
          {currentUserIsLoading ? <CircularProgress />
            : currentUserIsError ? <ErrorComponent
            ></ErrorComponent>
              : currentUser.role !== "admin" ? <div>You don't have permission</div>
                :
                <>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography sx={{ marginBottom: "12px !important", fontWeight: "bold !important", fontSize: "1.1rem" }}>
                        {`${user} パスワード変更`}
                      </Typography>
                      <Typography sx={{ marginBottom: "12px !important", fontSize: "0.8rem !important" }} color="text.secondary" >
                        英数字4文字以上のパスワードを入力してください
                      </Typography>
                      <Typography sx={{ marginBottom: "12px !important", fontSize: "0.8rem !important" }} color="#f44336">
                        {serverSideError}
                      </Typography>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form">
                          <Box sx={{ marginBottom: "1rem" }}>
                            <Controller
                              name="password"
                              control={control}
                              defaultValue=""
                              rules={{ required: true, minLength: 4, maxLength: 15, pattern: { value: /^[0-9a-zA-Z]+$/, message: "" } }}
                              render={({ field }) => <TextField size="small" fullWidth label="パスワード" {...field} />}
                            />
                            <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.password?.type === 'required' && "パスワードは必須です"}</Typography>
                            <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.password?.type === 'minLength' && "パスワードは4文字以上で入力してください"}</Typography>
                            <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.password?.type === 'maxLength' && "パスワードは15文字以下で入力してください"}</Typography>
                            <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.password?.type === 'pattern' && "パスワードは半角英数字で入力してください"}</Typography>
                          </Box>
                        </div>
                        <Button fullWidth variant="outlined" type="submit">
                          更新
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </>
          }
        </Box>
      </Layout>
    </>
  );
};

export const getStaticPaths = async () => {
  const paths = await getAllUserIDs();
  return {
    paths,
    fallback: false
  };
};

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      user: params.id
    }
  };
};

export default UserEditPage;
