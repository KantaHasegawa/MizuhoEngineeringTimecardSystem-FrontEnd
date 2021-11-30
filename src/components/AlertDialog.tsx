import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';

const AlertDialog = ({
  msg,
  isOpen,
  doYes,
  doNo,
}: {
  msg: any;
  isOpen: any;
  doYes: any;
  doNo: any;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <Dialog
        open={open}
        keepMounted
        onClose={() => doNo()}
        fullWidth
        maxWidth={'md'}
        aria-labelledby='common-dialog-title'
        aria-describedby='common-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'確認ダイアログ'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "red" }} id='alert-dialog-description'>{msg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => doNo()}>いいえ</Button>
          <Button onClick={() => doYes()}>はい</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertDialog;
