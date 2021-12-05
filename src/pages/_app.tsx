import { CssBaseline, Box } from '@mui/material';
import { AppProps } from 'next/app';
import { Router } from 'next/router';
import { SnackbarProvider } from 'notistack';
import NProgress from 'nprogress';
import { RecoilRoot } from 'recoil';
import 'nprogress/nprogress.css';
import '../../styels/global.css';
import { SWRConfig } from 'swr';
import AuthProvider from '../components/AuthProvider';
import Footer from '../components/Footer';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }): JSX.Element => {
  Router.events.on('routeChangeStart', (url) => {
    NProgress.start();
  });
  Router.events.on('routeChangeComplete', () => NProgress.done());
  Router.events.on('routeChangeError', () => NProgress.done());

  return (
    <RecoilRoot>
      <SWRConfig value={{ refreshInterval: 600000 }}>
        <CssBaseline />
        <AuthProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <SnackbarProvider>
              <Component {...pageProps} />
              <Footer />
            </SnackbarProvider>
          </Box>
        </AuthProvider>
      </SWRConfig>
    </RecoilRoot>
  );
};

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
