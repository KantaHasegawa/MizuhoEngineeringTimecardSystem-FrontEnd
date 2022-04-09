import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Backdrop,
  Tooltip,
  Box,
  Container,
  Select,
  MenuItem,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import Head from 'next/head';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { mutate } from 'swr';
dayjs.locale('ja');
import AlertDialog from '../../components/AlertDialog';
import ErrorComponent from '../../components/ErrorComponent';
import Navbar from '../../components/Navbar';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';
import useUserList from '../../hooks/useUserList';
import axios from '../../lib/axiosSetting';

type FormData = {
  user: string;
  year: string;
  month: string;
};

type TypeAxiosResponse = {
  user: string;
  workspot: string;
  attendance: string;
  leave: string;
  workTime: number;
  regularWorkTime: number;
  irregularWorkTime: number;
  rest: number;
};

type TypeTimecard = {
  user: string;
  date: number;
  dayOfWeek: string;
  workspot: string | null;
  attendance: string | null;
  leave: string | null;
  workTime: number | null;
  regularWorkTime: number | null;
  irregularWorkTime: number | null;
  rest: number | null;
};

const TimecardListPage = () => {
  useCurrentUser();
  useProtectedPage();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [timecard, setTimecard] = useState<TypeTimecard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const { handleSubmit, control, watch, getValues } = useForm<FormData>({
    defaultValues: { user: 'none', year: dayjs().format('YYYY'), month: dayjs().format('MM') },
  });
  const { state: userState } = useUserList();
  const years: string[] = [];

  for (let i = 2021; i <= 2100; i++) {
    years.push(`${i}`);
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await axios.get<TypeAxiosResponse[]>(
        `timecard/index/${data.user}/${data.year}/${data.month}`,
      );
      const daysInMonth = dayjs(`${data.year}-${data.month}`).daysInMonth();
      const newArray: TypeTimecard[] = [];
      let flag = false;
      for (let i = 1; i <= daysInMonth; i++) {
        for (let item of result.data) {
          let itemDate = Number(item.attendance.slice(6, 8));
          if (i < itemDate) break;
          if (i === itemDate) {
            const params = {
              user: data.user,
              date: i,
              dayOfWeek: dayjs(`${data.year}-${data.month}-${i}`).format('ddd'),
              workspot: item.workspot,
              attendance: item.attendance,
              leave: item.leave,
              workTime: item.workTime,
              regularWorkTime: item.regularWorkTime,
              irregularWorkTime: item.irregularWorkTime,
              rest: item.rest,
            };
            newArray.push(params);
            flag = true;
            break;
          }
        }
        if (flag) {
          flag = false;
          continue;
        } else {
          let params = {
            user: data.user,
            date: i,
            dayOfWeek: dayjs(`${data.year}-${data.month}-${i}`).format('ddd'),
            workspot: null,
            attendance: null,
            leave: null,
            workTime: null,
            regularWorkTime: null,
            irregularWorkTime: null,
            rest: null,
          };
          newArray.push(params);
        }
      }
      setTimecard(newArray);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onExcelHandler = async () => {
    setDialog(false);
    setLoading(true);
    const values = getValues();
    if (isMobile) {
      try {
        const result = await axios.get<string>(
          `timecard/excel/${values.user}/${values.year}/${values.month}/true`,
        );
        const link = document.createElement('a');
        link.setAttribute('href', result.data);
        document.body.appendChild(link);
        link.click();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const result = await axios.get(
          `timecard/excel/${values.user}/${values.year}/${values.month}/false`,
        );
        const url =
          'data:' +
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' +
          ';base64,' +
          result.data;
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${values.year}年${values.month}月${values.user}.xlsx`);
        document.body.appendChild(link);
        link.click();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const onDeleteHandler = async (user: string, attendance: string | null) => {
    if (!attendance) return;
    setLoading(true);
    const params = {
      user: user,
      attendance: attendance,
    };
    try {
      await axios.post('timecard/admin/delete', params);
      mutate(`timecard/common/${user}`);
      onSubmit({ user: user, year: attendance.slice(0, 4), month: attendance.slice(4, 6) });
      enqueueSnackbar('削除に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('削除に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ミズホエンジニアリング | 勤怠管理表</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Navbar></Navbar>
      {isUserLoading ? (
        <CircularProgress />
      ) : !userInfo.role ? (
        <ErrorComponent></ErrorComponent>
      ) : userInfo.role !== 'admin' ? (
        <PermissionErrorComponent></PermissionErrorComponent>
      ) : (
        <>
          <AlertDialog
            msg={
              'Excelファイルを出力します 集計を表示するにはダウンロード後Excelで開き保護ビューを解除してください'
            }
            isOpen={dialog}
            doYes={async () => onExcelHandler()}
            doNo={() => {
              setDialog(false);
            }}
          />
          <Container maxWidth='sm'>
            <Box sx={{ paddingTop: '2rem' }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name='user'
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ marginBottom: '1rem' }}>
                      <Select {...field} fullWidth>
                        <MenuItem value={'none'}>未選択</MenuItem>
                        {userState.data.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item}>
                              {item}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>
                  )}
                />
                <Controller
                  name='year'
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ marginBottom: '1rem' }}>
                      <Select {...field} fullWidth>
                        <MenuItem value={'none'}>未選択</MenuItem>
                        {years.map((item, index) => {
                          return <MenuItem key={index} value={item}>{`${item}年`}</MenuItem>;
                        })}
                      </Select>
                    </Box>
                  )}
                />
                <Controller
                  name='month'
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ marginBottom: '1rem' }}>
                      <Select {...field} fullWidth>
                        <MenuItem value={'none'}>未選択</MenuItem>
                        <MenuItem value={'01'}>1月</MenuItem>
                        <MenuItem value={'02'}>2月</MenuItem>
                        <MenuItem value={'03'}>3月</MenuItem>
                        <MenuItem value={'04'}>4月</MenuItem>
                        <MenuItem value={'05'}>5月</MenuItem>
                        <MenuItem value={'06'}>6月</MenuItem>
                        <MenuItem value={'07'}>7月</MenuItem>
                        <MenuItem value={'08'}>8月</MenuItem>
                        <MenuItem value={'09'}>9月</MenuItem>
                        <MenuItem value={'10'}>10月</MenuItem>
                        <MenuItem value={'11'}>11月</MenuItem>
                        <MenuItem value={'12'}>12月</MenuItem>
                      </Select>
                    </Box>
                  )}
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    sx={{
                      margin: '1rem',
                      width: '6rem',
                    }}
                    variant='outlined'
                    type='submit'
                    disabled={
                      watch('user') === 'none' ||
                      watch('year') === 'none' ||
                      watch('month') === 'none'
                    }
                  >
                    確定
                  </Button>
                  <Button
                    sx={{
                      margin: '1rem',
                      width: '6rem',
                    }}
                    variant='outlined'
                    color='success'
                    onClick={async () => setDialog(true)}
                    disabled={
                      watch('user') === 'none' ||
                      watch('year') === 'none' ||
                      watch('month') === 'none'
                    }
                  >
                    Excel
                  </Button>
                  <Link href='/timecard/new' passHref>
                    <Button
                      sx={{
                        margin: '1rem',
                        width: '6rem',
                      }}
                      variant='outlined'
                      color='info'
                    >
                      新規作成
                    </Button>
                  </Link>
                </Box>
              </form>
            </Box>
          </Container>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 1300, marginBottom: '2rem' }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>
                    <h3>日</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>曜日</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>出勤地</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>出勤時刻</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>退勤時刻</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>勤務時間</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>基本労働</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>時間外労働</h3>
                  </TableCell>
                  <TableCell align='center'>
                    <h3>休憩時間</h3>
                  </TableCell>
                  <TableCell align='center'></TableCell>
                </TableRow>
              </TableHead>
              {!timecard ? (
                <TableBody>
                  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                    <TableCell align='center'></TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {timecard.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align='center'>{row.date}</TableCell>
                      <TableCell align='center'>{row.dayOfWeek}</TableCell>
                      <TableCell align='center'>{row.workspot}</TableCell>
                      <TableCell align='center'>
                        {row.attendance &&
                          `${row.attendance.slice(8, 10)}:${row.attendance.slice(10, 12)}`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.leave && `${row.leave.slice(8, 10)}:${row.leave.slice(10, 12)}`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.workTime !== null &&
                          `${Math.floor(row.workTime / 60)}時間${row.workTime % 60}分`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.regularWorkTime !== null &&
                          `${Math.floor(row.regularWorkTime / 60)}時間${row.regularWorkTime % 60
                          }分`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.irregularWorkTime !== null &&
                          `${Math.floor(row.irregularWorkTime / 60)}時間${row.irregularWorkTime % 60
                          }分`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.rest !== null && `${Math.floor(row.rest / 60)}時間${row.rest % 60}分`}
                      </TableCell>
                      <TableCell align='center'>
                        {row.attendance && (
                          <Link href={`/timecard/edit/${row.user}/${row.attendance}`} passHref>
                            <Tooltip title='編集'>
                              <div>
                                <FontAwesomeIcon className='editIcon' icon={faEdit} size='lg' />
                              </div>
                            </Tooltip>
                          </Link>
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        {row.attendance && (
                          <Tooltip title='削除'>
                            <div onClick={async () => onDeleteHandler(row.user, row.attendance)}>
                              <FontAwesomeIcon icon={faTrashAlt} size='lg' className='trashIcon' />
                            </div>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
};

export default TimecardListPage;
