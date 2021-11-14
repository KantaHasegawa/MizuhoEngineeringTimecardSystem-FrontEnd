import {
  faMapMarkedAlt,
  faCalendarAlt,
  faUsers,
  faSignInAlt,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar, Box, Toolbar, Tooltip, CircularProgress } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import mizuhoLogo from '../../public/mizuho-logo.png';
import styles from '../../styels/layout.module.css';
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
              <div className={styles.imageWrapper}>
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
                <div className={styles.navbarIcons}>
                  <FontAwesomeIcon icon={faSignInAlt} size='2x' className={styles.navbarIcon} />
                </div>
              </Tooltip>
            ) : currentUser.role === 'admin' ? (
              <div className={styles.navbarIcons}>
                <Tooltip title='社員リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/user/list' passHref>
                      <FontAwesomeIcon icon={faUsers} size='2x' className={styles.navbarIcon} />
                    </Link>
                  </div>
                </Tooltip>
                <Tooltip title='勤務地リスト'>
                  <div style={{ display: 'inline' }}>
                    <Link href='/workspot/list' passHref>
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
                    <Link href='/timecard/list' passHref>
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
