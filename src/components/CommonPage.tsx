import 'dayjs/locale/ja';
import { CircularProgress, Box, Typography, Button, Backdrop } from '@mui/material';
import MUILink from '@mui/material/Link';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
// eslint-disable-next-line import/named
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { mutate } from 'swr';
import useFetchData from '../hooks/useFetchData';
import axios from '../lib/axiosSetting';
import AlertDialog from './AlertDialog';
import ErrorComponent from './ErrorComponent';
dayjs.locale('ja');

type TypeCurrentUser = {
  name: string;
  role: string;
};

export type TypeTimecard = {
  user: string;
  workspot: string;
  attendance: string;
  leave: string;
  workTime: number;
  regularWorkTime: number;
  irregularWorkTime: number;
  rest: number;
};

export type TypeUserRelation = {
  workspot: string;
  user: string;
  attendance: string;
  latitude: number;
  longitude: number;
};

type TypeUserRelationList = {
  params: TypeUserRelation[];
};

type TypeTimecardStatus = 'NotAttend' | 'NotLeave' | 'AlreadyLeave';

const isTimecardStatus = (timecard: TypeTimecard): TypeTimecardStatus => {
  const today = dayjs().format('YYYYMMDD');
  const result =
    timecard.leave === 'none'
      ? 'NotLeave'
      : timecard.attendance.slice(0, 8) === today
      ? 'AlreadyLeave'
      : 'NotAttend';
  return result;
};

const CommonPage = ({ user }: { user: TypeCurrentUser }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const { data: latestTimecard, error: latestTimecardIsError } = useFetchData<TypeTimecard>(
    `timecard/latest/${user.name}`,
  );
  const { data: userRelationList, error: userRelationListIsError } =
    useFetchData<TypeUserRelationList>(`relation/user/${user.name}`);

  const onClickHandler = async () => {
    setDialog(false);
    setLoading(true);
    if (!navigator.geolocation) {
      alert('お使いのブラウザは対応しておりません');
      return;
    }
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessFunction);
  };

  const getCurrentPositionSuccessFunction = async (position: GeolocationPosition) => {
    if (position.coords.accuracy > 1000) {
      enqueueSnackbar(
        '取得した位置情報の精度が悪いようです。電波状況の良い場所に移動するか、PCでアクセスしている場合は携帯端末に切り替えてください。',
        { variant: 'warning' },
      );
      setLoading(false);
      return;
    }
    const params = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    try {
      await axios.post('timecard/common', params);
      mutate(`timecard/latest/${user.name}`);
      mutate(`timecard/latestall`);
      enqueueSnackbar('成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('失敗しました', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const MainContents = () => {
    return !latestTimecard ? (
      <CircularProgress />
    ) : latestTimecardIsError ? (
      <ErrorComponent></ErrorComponent>
    ) : isTimecardStatus(latestTimecard) === 'NotAttend' ? (
      <Box>
        <AlertDialog
          msg={'出勤してよろしいですか？'}
          isOpen={dialog}
          doYes={async () => onClickHandler()}
          doNo={() => {
            setDialog(false);
          }}
        />
        <Typography >
          現在は未出勤です。現場に向かって出勤してください。
        </Typography>
        <Box sx={{ textAlign: 'center', margin: '3rem 0' }}>
          <Button
            sx={{ width: '16rem', height: '5rem', fontSize: "3rem" }}
            disabled={loading}
            variant='contained'
            color='info'
            onClick={() => setDialog(true)}
          >
            出勤
          </Button>
        </Box>
      </Box>
    ) : isTimecardStatus(latestTimecard) === 'NotLeave' ? (
      <Box>
        <AlertDialog
          msg={'退勤してよろしいですか？車の鍵を返していない場合は退勤する前に返してください。'}
          isOpen={dialog}
          doYes={async () => onClickHandler()}
          doNo={() => {
            setDialog(false);
          }}
        />
        <Typography >
          現在は出勤中です。出勤時刻は
          {`${latestTimecard.attendance.slice(4, 6)}月${latestTimecard.attendance.slice(
            6,
            8,
          )}日${latestTimecard.attendance.slice(8, 10)}時${latestTimecard.attendance.slice(
            10,
            12,
          )}分`}
          です。
        </Typography>
        <Box sx={{ textAlign: 'center', margin: '3rem 0' }}>
          <Button
            sx={{ width: '16rem', height: '5rem', fontSize: "3rem" }}
            disabled={loading}
            variant='contained'
            color='warning'
            onClick={() => setDialog(true)}
          >
            退勤
          </Button>
        </Box>
      </Box>
    ) : (
      <Box sx={{ marginBottom: '2rem' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>お疲れさまでした。</Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
          出勤時刻は
          {`${latestTimecard.attendance.slice(4, 6)}月${latestTimecard.attendance.slice(
            6,
            8,
          )}日${latestTimecard.attendance.slice(8, 10)}時${latestTimecard.attendance.slice(
            10,
            12,
          )}分`}
          、退勤時刻は
          {`${latestTimecard.leave.slice(4, 6)}月${latestTimecard.leave.slice(
            6,
            8,
          )}日${latestTimecard.leave.slice(8, 10)}時${latestTimecard.leave.slice(10, 12)}分`}
          です。
        </Typography>
      </Box>
    );
  };

  const WorkspotList = () => {
    const Row = ({ data, index, style }: ListChildComponentProps<TypeUserRelation[]>) => {
      return (
        <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
          <MUILink
            underline='hover'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://www.google.com/maps/search/?api=1&query=${data[index].latitude},${data[index].longitude}`}
          >
            {data[index].workspot}
          </MUILink>
        </div>
      );
    };

    return !userRelationList ? (
      <CircularProgress />
    ) : userRelationListIsError ? (
      <ErrorComponent></ErrorComponent>
    ) : (
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>登録された勤務地</Typography>
        <Typography >
          ここに登録された場所の半径1km以内で出勤または退勤が出来ます。
        </Typography>
        <Typography >
          リンクをタップするとGoogleMapが開きます。
        </Typography>
        <Box sx={{ marginTop: '1rem', marginBottom: '3rem' }}>
          <List
            className='List'
            height={350}
            width={'100%'}
            itemCount={userRelationList.params.length}
            itemData={userRelationList.params}
            itemSize={80}
          >
            {Row}
          </List>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
        {user.name}さんの勤怠管理ページ
      </Typography>
      <Typography >
        このアプリケーションは位置情報を使用しますので端末の位置情報機能が無効になっている場合は有効にしてください。
      </Typography>{' '}
      <br />
      <MainContents></MainContents>
      <WorkspotList></WorkspotList>
    </>
  );
};

export default CommonPage;
