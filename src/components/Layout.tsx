import { AppBar, Box, Button, IconButton, Toolbar, Typography, Container } from '@material-ui/core';
import Head from 'next/head';
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'This is the default title' }: Props) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Navbar></Navbar>
      <Container maxWidth='sm'>
        <Box sx={{ paddingTop: '2rem' }}>{children}</Box>
      </Container>
    </div>
  );
};

export default Layout;
