import { useRouter } from 'next/router'
import { Button } from "@mui/material";
import useAxios from '../hooks/useAxios';
import { useSetRecoilState } from "recoil";
import { accessTokenState } from '../components/atoms';
import Cookies from 'js-cookie'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import styles from '../styels/layout.module.scss'

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
      <div onClick={async () => onClickHandler()} style={{display: "inline"}} >
      <FontAwesomeIcon icon={faSignOutAlt} size="2x" className={styles.navbarIcon}/>
      </div>
  )
}

export default Logout
