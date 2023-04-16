import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  CircularProgress,
  Box,
  Tooltip,
  Typography,
  Backdrop,
  Select,
  MenuItem,
} from '@mui/material';
import serversideAxios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/named
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useRecoilValue } from 'recoil';
import { mutate } from 'swr';
import ErrorComponent from '../../../components/ErrorComponent';
import Layout from '../../../components/Layout';
import PermissionErrorComponent from '../../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../../components/atoms';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useFetchData from '../../../hooks/useFetchData';
import useProtectedPage from '../../../hooks/useProtectedPage';
import axios from '../../../lib/axiosSetting';

type TypeWorkspot = {
  workspot: {
    workspot: string;
    user: string;
    attendance: string;
    latitude: number;
    longitude: number;
  };
};

type RefreshTokenResponse = {
  accessToken: string;
};

export type TypeWorkspotRelation = {
  attendance: string;
  password: string;
  role: string;
  user: string;
};

type TypeWorkspotSelectBoxResponse = {
  selectBoxItems: string[];
  relations: TypeWorkspotRelation[];
};

const WorkspotRelationEditPage = ({
  workspot,
  isError,
}: {
  workspot: string;
  isError: boolean;
}) => {
  useCurrentUser();
  useProtectedPage();
  const router = useRouter();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('none');

  const { data: workspotSelectBoxResponse, error: workspotSelectBoxResponseIsError } =
    useFetchData<TypeWorkspotSelectBoxResponse>(`relation/workspot/selectbox/${workspot}`);

  const onChange = (event: any) => {
    setSelectedOption(event?.target?.value);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const params = {
        user: selectedOption,
        workspot: workspot,
      };
      await axios.post('relation/new', params);
      mutate(`relation/workspot/selectbox/${workspot}`);
      setSelectedOption('none');
      enqueueSnackbar('登録に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('登録に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (user: string) => {
    setLoading(true);
    try {
      const params = {
        user: user,
        workspot: workspot,
      };
      await axios.post('relation/delete', params);
      mutate(`relation/workspot/selectbox/${workspot}`);
      setSelectedOption('none');
      enqueueSnackbar('削除に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('削除に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ data, index, style }: ListChildComponentProps<TypeWorkspotRelation[]>) => {
    return (
      <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
        <Typography sx={{ fontSize: '1rem' }}>{data[index].user}</Typography>
        <Tooltip title='削除' placement='left-start'>
          <div onClick={async () => onDelete(data[index].user)}>
            <FontAwesomeIcon icon={faTrashAlt} size='lg' className='trashIcon' />
          </div>
        </Tooltip>
      </div>
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
        <Box>
          {isUserLoading ? (
            <CircularProgress />
          ) : !userInfo.role ? (
            <ErrorComponent></ErrorComponent>
          ) : userInfo.role !== 'admin' ? (
            <PermissionErrorComponent></PermissionErrorComponent>
          ) : (
            <>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{workspot}</Typography>
              {!workspotSelectBoxResponse ? (
                <CircularProgress />
              ) : workspotSelectBoxResponseIsError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <Box sx={{ marginBottom: '3rem' }}>
                  <Select fullWidth value={selectedOption} onChange={onChange}>
                    <MenuItem value='none'>未選択</MenuItem>
                    {workspotSelectBoxResponse.selectBoxItems.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <Box sx={{ textAlign: 'center', margin: '1rem' }}>
                    <Button
                      sx={{ width: '6rem' }}
                      variant='outlined'
                      onClick={async () => onSubmit()}
                      disabled={selectedOption === 'none'}
                    >
                      登録
                    </Button>
                  </Box>
                  {workspotSelectBoxResponse && (
                    <List
                      className='List'
                      height={650}
                      width={'100%'}
                      itemCount={workspotSelectBoxResponse.relations.length}
                      itemData={workspotSelectBoxResponse.relations}
                      itemSize={80}
                    >
                      {Row}
                    </List>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Layout>
    </>
  );
};

export default WorkspotRelationEditPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const host =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000/api/v1/'
      : process.env.NEXT_PUBLIC_API_HOST;
  const cookie = ctx.req?.headers.cookie;
  const { id } = ctx.query;
  console.log(host);

  if (!id || Array.isArray(id)) {
    return {
      notFound: true,
    };
  }

  try {
    const result = await serversideAxios.get<TypeWorkspot>(
      `${host}workspot/show?name=${encodeURI(id)}`,
      { headers: { cookie: cookie! } },
    );
    if (!result?.data?.workspot?.workspot) {
      return {
        notFound: true,
      };
    }
    return { props: { workspot: result.data.workspot.workspot } };
  } catch (err: any) {
    try {
      if (err.config && err.response && err.response.data.message === 'jwt expired') {
        const accessToken = await serversideAxios.get<RefreshTokenResponse>(`${host}auth/refresh`, {
          headers: { cookie: cookie! },
        });
        const result = await serversideAxios.get<TypeWorkspot>(
          `${host}workspot/show?name=${encodeURI(id)}`,
          {
            headers: { cookie: `accessToken=${accessToken.data.accessToken}` },
          },
        );
        if (!result?.data?.workspot?.workspot) {
          return {
            notFound: true,
          };
        }
        return { props: { timecard: result.data.workspot.workspot } };
      }
    } catch (err) {
      return { props: { isError: true } };
    }
    return { props: { isError: true } };
  }
};
