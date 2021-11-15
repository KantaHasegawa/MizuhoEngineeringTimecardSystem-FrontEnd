import { Box, Typography } from '@mui/material';

const ErrorComponent = () => {
  return (
    <Box
      color='white'
      sx={{
        textAlign: 'center',
        backgroundColor: '#F4909D',
        padding: '2rem',
        margin: '1rem',
        borderRadius: '50px',
      }}
    >
      <Typography>エラーが発生しました</Typography>
      <Typography>リロードする、または数秒経っても表示が切り替わらない場合は管理者にお問い合わせください</Typography>
    </Box>
  );
};

export default ErrorComponent;
