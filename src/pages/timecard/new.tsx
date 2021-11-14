import { LocalizationProvider, DateTimePicker } from '@mui/lab';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Stack,
  Backdrop,
} from '@mui/material';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import Select from 'react-select';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { accessTokenState } from '../../components/atoms';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser';
import useUserList from '../../hooks/useUserList';
import useWorkspotList from '../../hooks/useWorkspotList';
import 'dayjs/locale/ja';
dayjs.locale('ja');
dayjs.extend(isSameOrBefore);

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const TimecardNewPage = () => {
  const axios = useAxios();
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== 'admin'))
    router.push('/');

  const { state: userState } = useUserList();
  const selectBoxUsers =
    !userState.isLoading &&
    !userState.isError &&
    userState.data.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

  const { state: workspotState } = useWorkspotList();
  const selectBoxWorkspots =
    !workspotState.isLoading &&
    !workspotState.isError &&
    workspotState.data.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<dayjs.Dayjs | null>(dayjs());
  const [leave, setLeave] = useState<dayjs.Dayjs | null>(null);
  const [selectedUser, setSelectedUser] = useState<TypeSelectedOption>(null);
  const [selectedWorkspot, setSelectedWorkspot] = useState<TypeSelectedOption>(null);

  const handleAttendanceChange = (newValue: dayjs.Dayjs | null) => {
    setAttendance(newValue);
    if (!leave) return;
    if (leave.isSameOrBefore(newValue)) setLeave(null);
  };

  const handleLeaveChange = (newValue: dayjs.Dayjs | null) => {
    setLeave(newValue);
  };

  const onClickHandler = async () => {
    if (!attendance || !leave || !selectedUser || !selectedWorkspot) return;
    setLoading(true);
    const params = {
      user: selectedUser.value,
      workspot: selectedWorkspot.value,
      attendance: attendance.format('YYYYMMDDHHmmss'),
      leave: leave.format('YYYYMMDDHHmmss'),
    };
    try {
      await axios.post('timecard/admin/new', params);
      setSelectedUser(null);
      setSelectedWorkspot(null);
      setAttendance(null);
      setLeave(null);
      enqueueSnackbar('登録に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('登録に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const SelectBoxUsers = () => {
    return (
      <Box sx={{ marginBottom: '1rem' }}>
        {userState.isLoading ? (
          <CircularProgress />
        ) : userState.isError ? (
          <ErrorComponent></ErrorComponent>
        ) : (
          <Select
            defaultValue={selectedUser}
            value={selectedUser}
            onChange={setSelectedUser}
            options={selectBoxUsers || []}
            isClearable={true}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            placeholder='社員'
          />
        )}
      </Box>
    );
  };

  const SelelectBoxWorkspot = () => {
    return (
      <Box sx={{ marginBottom: '1rem' }}>
        {workspotState.isLoading ? (
          <CircularProgress />
        ) : workspotState.isError ? (
          <ErrorComponent></ErrorComponent>
        ) : (
          <Select
            defaultValue={selectedWorkspot}
            value={selectedWorkspot}
            onChange={setSelectedWorkspot}
            options={selectBoxWorkspots || []}
            isClearable={true}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            placeholder='勤務地'
          />
        )}
      </Box>
    );
  };

  return (
    <Layout title='ミズホエンジニアリング | 勤怠登録'>
      {currentUserIsLoading ? (
        <CircularProgress />
      ) : currentUserIsError ? (
        <ErrorComponent></ErrorComponent>
      ) : currentUser.role !== 'admin' ? (
        <PermissionErrorComponent></PermissionErrorComponent>
      ) : (
        <>
          <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>勤怠登録</Typography>
          <Typography sx={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            必要な情報を選択してください
          </Typography>
          <div>
            <SelectBoxUsers></SelectBoxUsers>
            <SelelectBoxWorkspot></SelelectBoxWorkspot>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={3} sx={{ marginBottom: '1rem' }}>
                <DateTimePicker
                  label='出勤時刻'
                  value={attendance}
                  onChange={handleAttendanceChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
              <Stack spacing={3} sx={{ marginBottom: '1rem' }}>
                <DateTimePicker
                  label='退勤時刻'
                  value={leave}
                  onChange={handleLeaveChange}
                  renderInput={(params) => <TextField {...params} />}
                  minDateTime={attendance ?? undefined}
                />
              </Stack>
            </LocalizationProvider>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant='outlined'
                disabled={!attendance || !leave || !selectedUser || !selectedWorkspot}
                onClick={async () => onClickHandler()}
                sx={{ width: '13rem' }}
              >
                登録
              </Button>
            </Box>
          </div>
        </>
      )}
    </Layout>
  );
};

export default TimecardNewPage;
