import { faMapMarkedAlt, faCalendarAlt, faUsers, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AppBar,
  Box,
  Toolbar,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import mizuhoLogo from '../../public/mizuho-logo.png';
import useCurrentUser from '../hooks/useCurrentUser';
import Logout from './Logout';
import { userInfoState, isUserLoadingState } from './atoms';

const Navbar = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const userInfo = useRecoilValue(userInfoState);
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const [open, setOpen] = useState(false);
  useCurrentUser();
  return (
    <header>
      {!matches ? (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position='static' color='default'>
            <Toolbar>
              <Tooltip title='ホーム'>
                <div style={{ cursor: 'pointer', padding: '0.3rem' }}>
                  <Link href='/' passHref>
                    <Image
                      src={mizuhoLogo}
                      alt='ミズホエンジニアリング'
                      width={80}
                      height={53}
                    ></Image>
                  </Link>
                </div>
              </Tooltip>
              {isUserLoading ? (
                <CircularProgress />
              ) : userInfo.role === 'admin' ? (
                <Box style={{ marginLeft: 'auto' }}>
                  <Tooltip title='社員リスト'>
                    <div style={{ display: 'inline' }}>
                      <Link href='/user/list' passHref>
                        <FontAwesomeIcon icon={faUsers} size='2x' className='navbarIcon' />
                      </Link>
                    </div>
                  </Tooltip>
                  <Tooltip title='勤務地リスト'>
                    <div style={{ display: 'inline' }}>
                      <Link href='/workspot/list' passHref>
                        <FontAwesomeIcon icon={faMapMarkedAlt} size='2x' className='navbarIcon' />
                      </Link>
                    </div>
                  </Tooltip>
                  <Tooltip title='勤怠管理表'>
                    <div style={{ display: 'inline' }}>
                      <Link href='/timecard/list' passHref>
                        <FontAwesomeIcon icon={faCalendarAlt} size='2x' className='navbarIcon' />
                      </Link>
                    </div>
                  </Tooltip>
                  <Logout></Logout>
                </Box>
              ) : (
                <Box style={{ marginLeft: 'auto' }}>
                  <Logout></Logout>
                </Box>
              )}
            </Toolbar>
          </AppBar>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position='static' color='default'>
            <Toolbar>
              <Tooltip title='ホーム'>
                <div style={{ cursor: 'pointer', padding: '0.3rem' }}>
                  <Link href='/' passHref>
                    <Image
                      src={mizuhoLogo}
                      alt='ミズホエンジニアリング'
                      width={80}
                      height={53}
                    ></Image>
                  </Link>
                </div>
              </Tooltip>
              <Box sx={{ marginLeft: 'auto' }} onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faBars} size='2x' className='navbarIcon' />
              </Box>
              <Drawer anchor='top' open={open} onClose={() => setOpen(false)}>
                <List>
                  {isUserLoading ? (
                    <CircularProgress />
                  ) : userInfo.role === 'admin' ? (
                    <>
                      <Link href='/user/list' passHref>
                        <ListItem>
                          <Box sx={{ display: 'block', width: '60px' }}>
                            <FontAwesomeIcon icon={faUsers} size='2x' className='drawerIcon' />
                          </Box>
                          <ListItemText primary='社員リスト' />
                        </ListItem>
                      </Link>

                      <Link href='/workspot/list' passHref>
                        <ListItem>
                          <Box sx={{ display: 'block', width: '60px' }}>
                            <FontAwesomeIcon
                              icon={faMapMarkedAlt}
                              size='2x'
                              className='drawerIcon'
                            />
                          </Box>
                          <ListItemText primary='勤務地リスト' />
                        </ListItem>
                      </Link>

                      <Link href='/timecard/list' passHref>
                        <ListItem>
                          <Box sx={{ display: 'block', width: '60px' }}>
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              size='2x'
                              className='drawerIcon'
                            />
                          </Box>
                          <ListItemText primary='勤怠管理表' />
                        </ListItem>
                      </Link>

                      <Logout></Logout>
                    </>
                  ) : (
                    <Box>
                      <Logout></Logout>
                    </Box>
                  )}
                </List>
              </Drawer>
            </Toolbar>
          </AppBar>
        </Box>
      )}
    </header>
  );
};

export default Navbar;
