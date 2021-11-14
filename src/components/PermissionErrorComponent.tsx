import { Box, Typography } from '@mui/material';

const PermissionErrorComponent = () => {
  return (
    <Box
      color='white'
      sx={{
        textAlign: 'center',
        backgroundColor: '#9AD59D',
        padding: '2rem',
        margin: '1rem',
        borderRadius: '50px',
      }}
    >
      <Typography>アクセス権限がありません</Typography>
      <Typography>数秒で画面が切り替わります</Typography>
    </Box>
  );
};

export default PermissionErrorComponent;
