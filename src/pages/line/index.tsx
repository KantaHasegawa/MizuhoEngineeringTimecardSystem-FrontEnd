import { Link as MUILink, Box, Typography, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { useRecoilValue } from 'recoil';
import LineLoginButton from '../../../public/btn_login_base.png';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';

const LineIndexPage = () => {
  useCurrentUser();
  useProtectedPage();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const lineState = Math.random().toString(32).substring(2);
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINE_REDIRECT_URL}&state=${lineState}&bot_prompt=aggressive&scope=profile%20openid&disable_auto_login=true`;
  return (
    <Layout title='ミズホエンジニアリング | LINE連携'>
      {isUserLoading ? (
        <CircularProgress />
      ) : !userInfo.role ? (
        <ErrorComponent></ErrorComponent>
      ) : userInfo.role !== 'admin' ? (
        <PermissionErrorComponent></PermissionErrorComponent>
      ) : (
        <Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>LINE通知連携</Typography>
          <Typography sx={{ fontSize: '0.8rem' }}>
            LINEと連携することで社員の出勤時と退勤時に通知を受け取ることができます
          </Typography>
          <Typography sx={{ fontSize: '0.8rem' }}>
            下のボタンからログインして公式アカウントを友達に追加してください
          </Typography>
          <Typography sx={{ fontSize: '0.8rem' }}>
            一度友達追加すれば後はログインしなくても大丈夫です
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'red' }}>
            デモサイトではこの機能は無効になります
          </Typography>
          <Box sx={{ textAlign: 'center', marginTop: '3rem' }}>
            {/* <MUILink href={url}> */}
            <Image src={LineLoginButton} alt='ラインでログイン'></Image>
            {/* </MUILink> */}
          </Box>
        </Box>
      )}
    </Layout>
  );
};
export default LineIndexPage;
