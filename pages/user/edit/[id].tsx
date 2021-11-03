import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { accessTokenState } from '../../../components/atoms';
import Layout from '../../../components/Layout'
import useCurrentUser from '../../../hooks/useCurrentUser';
import getAllUserIDs from '../../../lib/getAllUserIDs'
import { Controller, useForm } from 'react-hook-form'
import { TextField, Button, CircularProgress } from "@mui/material";
import { useState } from 'react';
import useAxios from '../../../hooks/useAxios';

type TypeParams = {
  id: string
}

type FormData = {
  password: string;
};

export const UserEditPage = ({ user }: { user: string }) => {
  const axios = useAxios();
  const router = useRouter();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [serverSideError, setServerSideError] = useState<string>("")
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const onSubmit = async (data: FormData) => {
    const params = {
      password: data.password,
      username: user
    }
    try {
      await axios.post(`user/edit`, params)
      reset({
        password: ""
      });
    } catch (err: any) {
      console.log(err.response)
      setServerSideError(err.response?.data?.message)
    }
  }
  return (
    <Layout title="ミズホエンジニアリング | パスワード変更">
      {currentUserIsLoading ? <CircularProgress />
        : currentUserIsError ? <div>error</div>
          : currentUser.role !== "admin" ? <div>You don't have permission</div>
            :
            <>
              <h3>{user}</h3>
              <div className="error">
                <p>{serverSideError}</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form">
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, minLength: 4, maxLength: 15, pattern: { value: /^[0-9a-zA-Z]+$/, message: "" } }}
                    render={({ field }) => <TextField label="パスワード" {...field} />}
                  />
                </div>
                <p>{errors.password?.type === 'required' && "パスワードは必須です"}</p>
                <p>{errors.password?.type === 'minLength' && "パスワードは4文字以上で入力してください"}</p>
                <p>{errors.password?.type === 'maxLength' && "パスワードは15文字以下で入力してください"}</p>
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

export const getStaticPaths = async () => {
  const paths = await getAllUserIDs();
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      user: params.id
    }
  }
}

export default UserEditPage;
