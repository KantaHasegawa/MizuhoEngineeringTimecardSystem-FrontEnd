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

type TypeUser = {
  user: {
    user: string,
    role: string,
    password: string,
    attendance: string
  }
}
export type TypeUserRelation = {
  workspot: string;
  user: string;
  attendance: string;
  latitude: number;
  longitude: number;
};

export type TypeSelectBoxItme = {
  value: string;
  label: string;
};

type TypeUserSelectBoxResponse = {
  selectBoxItems: TypeSelectBoxItme[];
  relations: TypeUserRelation[];
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const UserRelationEditPage = ({ user }: { user: string }) => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TypeSelectedOption>(null);

  const { data: userSelectBoxResponse, error: userSelectBoxResponseIsError } =
    useFetchData<TypeUserSelectBoxResponse>(`relation/user/selectbox/${user}`);

  const onSubmit = async () => {
    if (!selectedOption?.value) return;
    setLoading(true);
    try {
      const params = {
        user: user,
        workspot: selectedOption.value,
      };
      await axios.post('relation/new', params);
      mutate(`relation/user/selectbox/${user}`);
      setSelectedOption(null);
      enqueueSnackbar('登録に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('登録に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (workspot: string) => {
    setLoading(true);
    try {
      const params = {
        user: user,
        workspot: workspot,
      };
      await axios.post('relation/delete', params);
      mutate(`relation/user/selectbox/${user}`);
      setSelectedOption(null);
      enqueueSnackbar('削除に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('削除に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ data, index, style }: ListChildComponentProps<TypeUserRelation[]>) => {
    return (
      <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
        <Typography sx={{ fontSize: '1rem' }}>{data[index].workspot}</Typography>
        <Tooltip title='削除' placement='left-start'>
          <div onClick={async () => onDelete(data[index].workspot)}>
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
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user}</Typography>
              {!userSelectBoxResponse ? (
                <CircularProgress />
              ) : userSelectBoxResponseIsError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <Box sx={{ marginBottom: '3rem' }}>
                  <Select
                    defaultValue={selectedOption}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={userSelectBoxResponse.selectBoxItems}
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
                  {userSelectBoxResponse.relations && (
                    <List
                      className='List'
                      height={650}
                      width={'100%'}
                      itemCount={userSelectBoxResponse.relations.length}
                      itemData={userSelectBoxResponse.relations}
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

export default UserRelationEditPage;

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

  const result = await serversideAxios.get<TypeUser>(`${host}user/show?name=${encodeURI(id)}`, { headers: { cookie: cookie! } });
  if (!result?.data?.user?.user) {
    return {
      notFound: true
    };
  }
  return { props: { user: result.data.user.user } };
};
