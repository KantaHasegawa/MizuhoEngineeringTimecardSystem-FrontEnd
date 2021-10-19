import { useRouter } from 'next/router'
import { Button } from "@material-ui/core";
import useAxios from '../hooks/useAxios';
import { useSetRecoilState } from "recoil";
import { accessTokenState } from '../components/atoms';
import Cookies from 'js-cookie'

const Logout = () => {
  const axios = useAxios();
  const router = useRouter();
  const setAccessToken = useSetRecoilState(accessTokenState);
  const refreshToken = Cookies.get("refreshToken")
  const onClickHandler = async () => {
    try {
      await axios.post("auth/logout", { refreshToken: refreshToken })
      setAccessToken("")
      router.push("/auth/login")
    } catch (err: any) {
      console.log(err.response.data)
    }
  }
  return (
    <Button onClick={async() => onClickHandler()}>Logout</Button>
  )
}

export default Logout
