import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Logout from './Logout'
import styles from '../styels/layout.module.scss'
import { AppBar, Box, Button, IconButton, Toolbar, Typography, Container } from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarked, faCalendarAlt, faUsers, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import mizuhoLogo from '../public/mizuho-logo.png'
import useCurrentUser from '../hooks/useCurrentUser'
import { accessTokenState } from './atoms'
import { useRecoilValue } from 'recoil'
import { CircularProgress } from '@material-ui/core'
import Navbar from './Navbar'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = "This is the default title" }: Props) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar></Navbar>
      <Container maxWidth="sm">
        <Box sx={{paddingTop: "2rem"}}>
        {children}
      </Box>
    </Container>
    </div>
  );
}

export default Layout
