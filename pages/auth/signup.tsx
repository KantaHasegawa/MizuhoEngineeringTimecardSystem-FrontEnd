import { useRouter } from 'next/router'
import Layout from '../../components/Layout';
import { Controller, useForm } from 'react-hook-form'
import { TextField, Button } from "@material-ui/core";
import { useState } from 'react';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser'
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';

type FormData = {
  username: string;
  password: string;
};

const SignUpPage = () => {
  const axios = useAxios();
  const router = useRouter();
  const [serverSideError, setServerSideError] = useState<string>("")
  const accessToken = useRecoilValue(accessTokenState)
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { user, isLoading, isError } = useCurrentUser(accessToken);
  if (user && user.role !== "admin") router.push("/")
  const onSubmit = async (data: FormData) => {
    try {
      await axios.post(`user/signup`, data)
    } catch (err: any) {
      console.log(err.response)
      setServerSideError(err.response?.data?.message)
    }
  }

  return (
    <Layout title="ミズホエンジニアリング | サインアップ">
      {isLoading ? <div>loading</div>
        : isError ? <div>error</div>
          : user.role !== "admin" ? <div>You don't have permission</div>
          :
          <>
            <h1>サインアップ</h1>
            <div className="error">
              <p>{serverSideError}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form">
                <Controller
                  name="username"
                  control={control}
                  defaultValue=""
                  rules={{ required: true, pattern: { value: /^[ぁ-んァ-ヶｱ-ﾝﾞﾟ一-龠]*$/, message: "" } }}
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
                登録
              </Button>
            </form>
          </>
      }
    </Layout>
  )
}

export default SignUpPage
