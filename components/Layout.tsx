import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Logout from './Logout'
import styles from '../styels/layout.module.scss'
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarked, faCalendarAlt, faUsers, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import mizuhoLogo from '../public/mizuho-logo.png'
import useCurrentUser from '../hooks/useCurrentUser'
import { accessTokenState } from './atoms'
import { useRecoilValue } from 'recoil'
import { CircularProgress } from '@material-ui/core'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = "This is the default title" }: Props) => {
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography>
                <div className={styles.imageWrapper}>
                  <Link href="/">
                    <Image
                      className={styles.logo}
                      src={mizuhoLogo}
                      alt="ミズホエンジニアリング"
                      width={100}
                      height={66}
                    ></Image>
                  </Link>
                </div>
              </Typography>
              {currentUserIsLoading ? <CircularProgress />
                : currentUserIsError ? (
                  <div className={styles.navbarIcons}>
                    <FontAwesomeIcon icon={faSignInAlt} size="2x" className={styles.navbarIcon} />
                  </div>
                )
                  : currentUser.role === "admin" ? (
                    <div className={styles.navbarIcons}>
                      <Link href="/user/list">
                        <FontAwesomeIcon icon={faUsers} size="2x" className={styles.navbarIcon} />
                      </Link>
                      <Link href="/timecard/list">
                        <FontAwesomeIcon icon={faCalendarAlt} size="2x" className={styles.navbarIcon} />
                      </Link>
                      <Link href="/workspot/list">
                        <FontAwesomeIcon icon={faMapMarked} size="2x" className={styles.navbarIcon} />
                      </Link>
                      <Logout></Logout>
                    </div>
                  )
                    : (
                      <div className={styles.navbarIcons}>
                      <Logout></Logout>
                      </div>
                    )
              }
            </Toolbar>
          </AppBar>
        </Box>
      </header>
      <div className={styles.container}>{children}</div>
    </div>
  );
}

export default Layout
