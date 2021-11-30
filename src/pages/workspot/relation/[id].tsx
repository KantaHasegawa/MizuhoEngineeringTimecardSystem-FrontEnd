import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, CircularProgress, Box, Tooltip, Typography, Backdrop } from '@mui/material';
import { GetServerSideProps } from 'next';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import Select from 'react-select';
// eslint-disable-next-line import/named
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useRecoilValue } from 'recoil';
import { mutate } from 'swr';
import ErrorComponent from '../../../components/ErrorComponent';
import Layout from '../../../components/Layout';
import PermissionErrorComponent from '../../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../../components/atoms';
import useCsrf from '../../../hooks/useCsrf';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useFetchData from '../../../hooks/useFetchData';
import useProtectedPage from '../../../hooks/useProtectedPage';
import axios from '../../../lib/axiosSetting';
import serversideAxios from '../../../lib/axiosSettingServerside';

type TypeWorkspot = {
  workspot: {
    workspot: string;
    user: string;
    attendance: string;
    latitude: number;
    longitude: number;
  }
}

export type TypeWorkspotRelation = {
  attendance: string;
  password: string;
  role: string;
  user: string;
};

export type TypeSelectBoxItme = {
  value: string;
  label: string;
};

type TypeWorkspotSelectBoxResponse = {
  selectBoxItems: TypeSelectBoxItme[];
  relations: TypeWorkspotRelation[];
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const WorkspotRelationEditPage = ({ workspot }: { workspot: string }) => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TypeSelectedOption>(null);

  const { data: workspotSelectBoxResponse, error: workspotSelectBoxResponseIsError } =
    useFetchData<TypeWorkspotSelectBoxResponse>(`relation/workspot/selectbox/${workspot}`);

  const onSubmit = async () => {
    if (!selectedOption?.value) return;
    setLoading(true);
    try {
      const params = {
        user: selectedOption.value,
        workspot: workspot,
      };
      await axios.post('relation/new', params);
      mutate(`relation/workspot/selectbox/${workspot}`);
      setSelectedOption(null);
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
      setSelectedOption(null);
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
                <Box sx={{marginBottom: '3rem'}}>
                  <Select
                    defaultValue={selectedOption}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={workspotSelectBoxResponse.selectBoxItems}
                    isClearable={true}
                  />
                  <Box sx={{ textAlign: 'center', margin: '1rem' }}>
                    <Button
                      sx={{ width: '6rem' }}
                      variant='outlined'
                      onClick={async () => onSubmit()}
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
      ? 'http://backend:4000/api/v1/'
      : process.env.NEXT_PUBLIC_API_HOST;
  const cookie = ctx.req?.headers.cookie;
  const { id } = ctx.query;
  console.log(host);

  if (!id || Array.isArray(id)) {
    return {
      notFound: true
    };
  }

  const result = await serversideAxios.get<TypeWorkspot>(`${host}workspot/show?name=${encodeURI(id)}`, { headers: { cookie: cookie! } });
  console.log(result.data);
  if (!result?.data?.workspot?.workspot) {
    return {
      notFound: true
    };
  }
  return { props: { workspot: result.data.workspot.workspot } };
};
