import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Tooltip,
  Backdrop,
  CircularProgress,
  useMediaQuery,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import axios from '../lib/axiosSetting';
import AlertDialog from './AlertDialog';
import { userInfoState } from './atoms';

const Logout = () => {
  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const setUserInfo = useSetRecoilState(userInfoState);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const onClickHandler = async () => {
    setLoading(true);
    try {
      await axios.get('auth/logout');
      setUserInfo({ name: '', role: '' });
      router.push('/auth/login');
      enqueueSnackbar('ログアウトしました', { variant: 'success' });
    } catch (err) {
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
      {!matches ? (
        <Tooltip title='ログアウト'>
          <div onClick={() => setDialog(true)} style={{ display: 'inline' }}>
            <FontAwesomeIcon icon={faSignOutAlt} size='2x' className='navbarIcon' />
          </div>
        </Tooltip>
      ) : (
        <ListItem onClick={() => setDialog(true)}>
          <Box sx={{ display: 'block', width: '60px' }}>
            <FontAwesomeIcon icon={faSignOutAlt} size='2x' className='drawerIcon' />
          </Box>
          <ListItemText primary='ログアウト' />
        </ListItem>
      )}
    </>
  );
};

export default Logout;
