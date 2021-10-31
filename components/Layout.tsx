import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Logout from './Logout'
import styles from '../styels/layout.module.scss'

type Props = {
  children?: ReactNode
  title?: string
}

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header>
      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>{" "}
        |{" "}
        <Link href="/auth/login">
          <a>login</a>
        </Link>{" "}
        |{" "}
        <Link href="/auth/signup">
          <a>signup</a>
        </Link>{" "}
        |{" "}
        <Link href="/user/list">
          <a>Users List</a>
        </Link>{" "}
        |{" "}
        <Link href="/workspot/list">
          <a>Workspot List</a>
        </Link>{" "}
        | <Logout></Logout>
      </nav>
    </header>
    <div className={styles.container}>{children}</div>
    <footer>
      <hr />
      <span>I'm here to stay (Footer)</span>
    </footer>
  </div>
);

export default Layout
