import { useRouter } from 'next/router'
import Layout from '../../components/Layout';
import { Controller, useForm } from 'react-hook-form'
import { TextField, Button, CircularProgress, Box, Card, CardContent, Typography } from "@mui/material";
import { useState } from 'react';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser'
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';
import styles from '../../styels/signup.module.scss'

type FormData = {
  username: string;
  password: string;
};

const SignUpPage = () => {
  const axios = useAxios();
  const router = useRouter();
  const [serverSideError, setServerSideError] = useState<string>("")
  const accessToken = useRecoilValue(accessTokenState)
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const onSubmit = async (data: FormData) => {
    try {
      await axios.post(`user/signup`, data)
      reset({
        username: "",
        password: ""
      });
    } catch (err: any) {
      console.log(err.response)
      setServerSideError(err.response?.data?.errors[0].msg)
    }
  }

  return (
    <Layout title="ミズホエンジニアリング | サインアップ">
      <Box sx={{ paddingTop: "2rem", width: "350px", marginLeft: "auto", marginRight: "auto" }}>
        {currentUserIsLoading ? <CircularProgress />
          : currentUserIsError ? <div>error</div>
            : currentUser.role !== "admin" ? <div>You don't have permission</div>
              :
              <>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" sx={{ marginBottom: "12px !important", fontWeight: "bold !important" }}>
                      社員登録
                    </Typography>
                    <Typography sx={{ marginBottom: "12px !important", fontSize: "0.8rem !important" }} color="text.secondary" >
                      氏名と英数字4文字以上のパスワードを入力してください
                    </Typography>
                    <Typography sx={{ marginBottom: "12px !important", fontSize: "0.8rem !important" }} color="#f44336">
                      {serverSideError}
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="form">
                        <div className={styles.textField}>
                          <Controller
                            name="username"
                            control={control}
                            defaultValue=""
                            rules={{ required: true, pattern: { value: /^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]*$/, message: "" } }}
                            render={({ field }) => <TextField size="small" fullWidth label="氏名" {...field} />}
                          />
                          <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.username?.type === 'required' && "氏名は必須です"}</Typography>
                          <Typography sx={{ fontSize: "0.8rem !important" }} color="#f44336">{errors.username?.type === 'pattern' && "氏名は日本語で入力してください"}</Typography>
                        </div>
                      </div>

                      <div className="form">
                        <div className={styles.textField}>
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
                        </div>
                      </div>
                      <Button fullWidth variant="outlined" type="submit">
                        登録
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
        }
      </Box>
    </Layout>
  )
}

export default SignUpPage
