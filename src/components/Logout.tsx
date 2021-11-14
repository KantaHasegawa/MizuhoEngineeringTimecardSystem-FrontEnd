import { useRouter } from 'next/router';
import { Tooltip, Backdrop, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import useAxios from '../hooks/useAxios';
import { useSetRecoilState } from 'recoil';
import { accessTokenState } from './atoms';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styels/layout.module.css';
import { useState } from 'react';
import AlertDialog from './AlertDialog';

const Logout = () => {
  const axios = useAxios();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const setAccessToken = useSetRecoilState(accessTokenState);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const refreshToken = Cookies.get('refreshToken');
  const onClickHandler = async () => {
    setLoading(true);
    try {
      await axios.post('auth/logout', { refreshToken: refreshToken });
      setAccessToken('');
      router.push('/auth/login');
      enqueueSnackbar('ログアウトしました', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('ログアウトに失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <AlertDialog
        msg={'本当にログアウトしますか？'}
        isOpen={dialog}
        doYes={async () => onClickHandler()}
        doNo={() => {
          setDialog(false);
        }}
      />
      <Tooltip title='ログアウト'>
        <div onClick={() => setDialog(true)} style={{ display: 'inline' }}>
          <FontAwesomeIcon icon={faSignOutAlt} size='2x' className={styles.navbarIcon} />
        </div>
      </Tooltip>
    </>
  );
};

export default Logout;
