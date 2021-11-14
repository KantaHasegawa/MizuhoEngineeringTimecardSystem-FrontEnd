import React, { ReactNode } from 'react';
import Link from 'next/link';
import Logout from './Logout';
import styles from '../../styels/layout.module.css';
import { AppBar, Box, Toolbar, Tooltip, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkedAlt,
  faCalendarAlt,
  faUsers,
  faSignInAlt,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mizuhoLogo from '../../public/mizuho-logo.png';
import useCurrentUser from '../hooks/useCurrentUser';
import { accessTokenState } from './atoms';
import { useRecoilValue } from 'recoil';

const Navbar = () => {
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  return (
    <header>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static' color='default'>
          <Toolbar>
            <Tooltip title='ホーム'>
              <div className={styles.imageWrapper}>
                <Link href='/'>
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
                <div className={styles.navbarIcons}>
                  <FontAwesomeIcon icon={faSignInAlt} size='2x' className={styles.navbarIcon} />
                </div>
              </Tooltip>
            ) : currentUser.role === 'admin' ? (
              <div className={styles.navbarIcons}>
                <Tooltip title='社員リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/user/list'>
                      <FontAwesomeIcon icon={faUsers} size='2x' className={styles.navbarIcon} />
                    </Link>
                  </div>
                </Tooltip>
                <Tooltip title='勤務地リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/workspot/list'>
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        size='2x'
                        className={styles.navbarIcon}
                      />
                    </Link>
                  </div>
                </Tooltip>
                <Tooltip title='勤怠管理表'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/timecard/list'>
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        size='2x'
                        className={styles.navbarIcon}
                      />
                    </Link>
                  </div>
                </Tooltip>
                <Logout></Logout>
              </div>
            ) : (
              <div className={styles.navbarIcons}>
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
