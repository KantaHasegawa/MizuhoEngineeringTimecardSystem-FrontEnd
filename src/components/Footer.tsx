import { useMediaQuery, Box, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import mizuhoLogo from '../../public/mizuho-logo.png';

const Footer = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <Box
      sx={{
        backgroundColor: '#828787',
        color: 'white',
        marginTop: 'auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Image src={mizuhoLogo} alt='ミズホエンジニアリング' width={160} height={106}></Image>
        <Typography sx={{ marginTop: '1rem' }}>株式会社ミズホエンジニアリング</Typography>
      </Box>
      <Box>
        <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            href='http://www.mizuho-engi.jp/company.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', margin: '1rem 0' }}
          >
            会社情報
          </Link>
          <Link
            href='http://www.mizuho-engi.jp/reclute.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            採用情報
          </Link>
          <Link
            href='http://www.mizuho-engi.jp/contact.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            お問い合わせ
          </Link>
          <Link
            href='https://github.com/KantaHasegawa'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            サイト管理者
          </Link>
        </Box>
      </Box>
      <Typography sx={{ marginTop: '2rem' }}>© MizuhoEngineering.</Typography>
    </Box>
  ) : (
    <Box
      sx={{
        backgroundColor: '#979B9B',
        color: 'white',
        marginTop: 'auto',
        padding: '2rem 10rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ textAlign: 'center', width: '20rem' }}>
        <Image src={mizuhoLogo} alt='ミズホエンジニアリング' width={160} height={106}></Image>
        <Typography sx={{ marginTop: '1rem' }}>株式会社ミズホエンジニアリング</Typography>
        <Typography sx={{ marginTop: '2rem' }}>© MizuhoEngineering.</Typography>
      </Box>
      <Box>
        <Box sx={{ width: '8rem' }}>
          <Link
            href='http://www.mizuho-engi.jp/company.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginTop: '3rem', marginBottom: '1rem' }}
          >
            {' '}
            会社情報
          </Link>
          <Link
            href='http://www.mizuho-engi.jp/reclute.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            採用情報
          </Link>
          <Link
            href='http://www.mizuho-engi.jp/contact.html'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            {' '}
            お問い合わせ
          </Link>
          <Link
            href='https://github.com/KantaHasegawa'
            underline='hover'
            sx={{ color: 'white', display: 'block', marginBottom: '1rem' }}
          >
            管理者
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
