import { useRouter } from 'next/router'
import Layout from '../../components/Layout';
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { TextField, Button } from "@material-ui/core";
import { useRecoilState } from 'recoil';
import { accessTokenState, userState } from '../../components/atoms'
import { useState } from 'react';

type FormData = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const [serverSideError, setServerSideError] = useState<string>("")
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  const [user, setUser] = useRecoilState(userState);
  const onSubmit = async (data: FormData) => {
    try {
      const result: any = await axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/auth/login`, data)
      setAccessToken(result.data.accessToken)
      setUser(data.username)
      router.push("/")
    } catch (err: any) {
      setServerSideError(err.response.data.message)
    }
  }
  return (
    <Layout title="ミズホエンジニアリング | ログイン">
      <h1>ログイン</h1>
      <div className="error">
        <p>{serverSideError}</p>
      </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form">
            <Controller
              name="username"
              control={control}
              defaultValue=""
              rules={{ required: true, pattern: {value: /^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]*$/, message: ""} }}
              render={({ field }) => <TextField label="ユーザー名" {...field} />}
            />
        </div>
        <p>{errors.username?.type === 'required' && "ユーザー名は必須です"}</p>
        <p>{errors.username?.type === 'pattern' && "ユーザー名は日本語で入力してください"}</p>
          <div className="form">
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{ required: true, pattern: { value: /^[0-9a-zA-Z]+$/, message: "" } }}
              render={({ field }) => <TextField label="パスワード" {...field} />}
            />
        </div>
        <p>{errors.password?.type === 'required' && "パスワードは必須です"}</p>
        <p>{errors.password?.type === 'pattern' && "パスワードは半角英数字で入力してください"}</p>
        <Button type="submit">
          ログイン
        </Button>
        </form>
      <p>{accessToken}</p>
    </Layout>
  )
}

export default LoginPage
