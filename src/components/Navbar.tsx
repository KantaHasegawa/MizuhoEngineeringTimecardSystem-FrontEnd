import {
  faMapMarkedAlt,
  faCalendarAlt,
  faUsers,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar, Box, Toolbar, Tooltip, CircularProgress } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useRecoilValue } from 'recoil';
import mizuhoLogo from '../../public/mizuho-logo.png';
import useCurrentUser from '../hooks/useCurrentUser';
import Logout from './Logout';
import { accessTokenState } from './atoms';

const Navbar = () => {
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  return (
    <header>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static' color='default'>
          <Toolbar>
            <Tooltip title='ホーム'>
              <div style={{ cursor: "pointer", padding: "0.3rem" }}>
                <Link href='/' passHref>
                  <Image
                    src={mizuhoLogo}
                    alt='ミズホエンジニアリング'
                    width={100}
                    height={66}
                  ></Image>
                </Link>
              </div>
            </Tooltip>
            {currentUserIsLoading ? (
              <CircularProgress />
            ) : currentUserIsError ? (
              <Tooltip title='ログイン'>
                <div style={{ marginLeft: "auto" }}>
                  <FontAwesomeIcon icon={faSignInAlt} size='2x' className="navbarIcon" />
                </div>
              </Tooltip>
            ) : currentUser.role === 'admin' ? (
              <div style={{ marginLeft: "auto" }}>
                <Tooltip title='社員リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/user/list' passHref>
                      <FontAwesomeIcon icon={faUsers} size='2x' className="navbarIcon" />
                    </Link>
                  </div>
                </Tooltip>
                <Tooltip title='勤務地リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/workspot/list' passHref>
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        size='2x'
                        className="navbarIcon"
                      />
                    </Link>
                  </div>
                </Tooltip>
                <Tooltip title='勤怠管理表'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/timecard/list' passHref>
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size='2x'
                        className="navbarIcon"
                      />
                    </Link>
                  </div>
                </Tooltip>
                <Logout></Logout>
              </div>
            ) : (
              <div style={{ marginLeft: "auto" }}>
                <Logout></Logout>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </header>
  );
};

export default Navbar;
