import { LocalizationProvider, MobileDateTimePicker } from '@mui/lab';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import {
  CircularProgress,
  Backdrop,
  Box,
  Typography,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import serversideAxios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/named
import Select from 'react-select';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../../../components/ErrorComponent';
import Layout from '../../../../components/Layout';
import PermissionErrorComponent from '../../../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../../../components/atoms';
import useCsrf from '../../../../hooks/useCsrf';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import useProtectedPage from '../../../../hooks/useProtectedPage';
import useWorkspotList from '../../../../hooks/useWorkspotList';
import axios from '../../../../lib/axiosSetting';
dayjs.extend(isSameOrBefore);

type Timecard =
  | {
      user: string;
      workspot: string;
      attendance: string;
      leave: string;
      workTime: number;
      regularWorkTime: number;
      irregularWorkTime: number;
      rest: number;
    }
  | undefined;

type TimecardResponse = {
  timecard: Timecard;
};

type RefreshTokenResponse = {
  accessToken: string;
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const TimecardEditPage = ({ timecard, isError }: { timecard: Timecard; isError: boolean }) => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const router = useRouter();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const { state: workspotState } = useWorkspotList();
  const [loading, setLoading] = useState(false);
  const [leave, setLeave] = useState<dayjs.Dayjs | null>(
    timecard && timecard.leave !== 'none' ? dayjs(timecard.leave) : null,
  );
  const [rest, setRest] = useState<number>(timecard ? timecard.rest : 60);
  const [selectedWorkspot, setSelectedWorkspot] = useState<TypeSelectedOption>(
    timecard ? { label: timecard.workspot, value: timecard.workspot } : null,
  );
  const selectBoxWorkspots =
    !workspotState.isLoading &&
    !workspotState.isError &&
    workspotState.data.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

  const handleLeaveChange = (newValue: dayjs.Dayjs | null) => {
    setLeave(newValue);
  };

  const handleRestChange = (e: any) => {
    setRest(e?.target?.value);
  };

  const onClickHandler = async () => {
    if (!leave || !selectedWorkspot) return;
    setLoading(true);
    const params = {
      user: timecard && timecard.user,
      workspot: selectedWorkspot.value,
      attendance: timecard && timecard.attendance,
      leave: leave.format('YYYYMMDDHHmm') + '00',
      rest: rest,
    };
    try {
      await axios.post('timecard/admin/edit', params);
      enqueueSnackbar('編集に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('編集に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const SelelectBoxWorkspot = () => {
    return (
      <Box sx={{ marginBottom: '1rem' }}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>
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

  useEffect(() => {
    if (isError) {
      router.push('/auth/login');
    }
  }, []);

  if (isError) {
    return <ErrorComponent />;
  }
  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Layout title='ミズホエンジニアリング | 編集'>
        {isUserLoading ? (
          <CircularProgress />
        ) : !userInfo.role ? (
          <ErrorComponent></ErrorComponent>
        ) : userInfo.role !== 'admin' ? (
          <PermissionErrorComponent></PermissionErrorComponent>
        ) : (
          <>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{`${
                timecard && timecard.user
              }さんの勤怠情報の編集`}</Typography>
              <Typography sx={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                必要な情報を選択してください
              </Typography>
              <SelelectBoxWorkspot></SelelectBoxWorkspot>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={3} sx={{ marginBottom: '1rem' }}>
                  <MobileDateTimePicker
                    label='出勤時刻'
                    value={timecard && timecard.attendance}
                    onChange={() => {}}
                    disabled
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
                <Stack spacing={3} sx={{ marginBottom: '1rem' }}>
                  <MobileDateTimePicker
                    label='退勤時刻'
                    value={leave}
                    onChange={handleLeaveChange}
                    renderInput={(params) => <TextField {...params} />}
                    minDateTime={timecard && (dayjs(timecard.attendance) ?? undefined)}
                  />
                </Stack>
              </LocalizationProvider>
              <TextField
                fullWidth
                label='休憩時間'
                type='number'
                value={rest}
                onChange={handleRestChange}
                sx={{ marginBottom: '1rem' }}
              />
              <Box sx={{ textAlign: 'center', marginBottom: '3rem' }}>
                <Button
                  variant='outlined'
                  disabled={!leave || !selectedWorkspot}
                  onClick={async () => onClickHandler()}
                  sx={{ width: '13rem' }}
                >
                  登録
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Layout>
    </>
  );
};

export default TimecardEditPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const host =
    process.env.NODE_ENV === 'development'
      ? 'http://backend:4000/api/v1/'
      : process.env.NEXT_PUBLIC_API_HOST;
  const cookie = ctx.req?.headers.cookie;
  const { id, attendance } = ctx.query;

  if (!id || !attendance || Array.isArray(id) || Array.isArray(attendance)) {
    return {
      notFound: true,
    };
  }
  try {
    const result = await serversideAxios.get<TimecardResponse>(
      `${host}timecard/show?username=${encodeURI(id)}&attendance=${encodeURI(attendance)}`,
      { headers: { cookie: cookie! } },
    );
    if (!result?.data?.timecard) {
      return {
        notFound: true,
      };
    }
    return { props: { timecard: result.data.timecard } };
  } catch (err: any) {
    try {
      if (err.config && err.response && err.response.data.message === 'jwt expired') {
        const accessToken = await serversideAxios.get<RefreshTokenResponse>(`${host}auth/refresh`, {
          headers: { cookie: cookie! },
        });
        const result = await serversideAxios.get<TimecardResponse>(
          `${host}timecard/show?username=${encodeURI(id)}&attendance=${encodeURI(attendance)}`,
          {
            headers: { cookie: `accessToken=${accessToken.data.accessToken}` },
          },
        );
        if (!result?.data?.timecard) {
          return {
            notFound: true,
          };
        }
        return { props: { timecard: result.data.timecard } };
      }
    } catch (err) {
      return { props: { isError: true } };
    }
    return { props: { isError: true } };
  }
};
