import { AppProps } from 'next/app'
import { CssBaseline, Box } from "@mui/material";
import { RecoilRoot } from "recoil"
import { SnackbarProvider } from 'notistack'
import '../styels/global.css';
import Footer from '../components/Footer';


const MyApp: React.FC<AppProps> = ({ Component, pageProps }): JSX.Element => {
  return (
    <RecoilRoot>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <SnackbarProvider>
          <Component {...pageProps} />
          <Footer />
        </SnackbarProvider>
      </Box>
    </RecoilRoot>
  )
}

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

export default MyApp
