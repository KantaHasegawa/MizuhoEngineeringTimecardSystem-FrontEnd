import { useRouter } from 'next/router'
import { Tooltip} from '@mui/material'
import { useSnackbar } from 'notistack'
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
  const { enqueueSnackbar } = useSnackbar();
  const setAccessToken = useSetRecoilState(accessTokenState);
  const refreshToken = Cookies.get("refreshToken")
  const onClickHandler = async () => {
    try {
      await axios.post("auth/logout", { refreshToken: refreshToken })
      setAccessToken("")
      router.push("/auth/login")
      enqueueSnackbar("ログアウトしました", { variant: "success" })
    } catch (err: any) {
      enqueueSnackbar("ログアウトに失敗しました", { variant: "error" })
      console.log(err)
    }
  }
  return (
    <Tooltip title="ログアウト">
      <div onClick={async () => onClickHandler()} style={{ display: "inline" }} >
        <FontAwesomeIcon icon={faSignOutAlt} size="2x" className={styles.navbarIcon} />
      </div>
    </Tooltip>
  )
}

export default Logout
