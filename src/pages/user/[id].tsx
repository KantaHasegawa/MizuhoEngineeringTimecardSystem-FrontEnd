import { faUserEdit, faMapMarkedAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  CircularProgress,
  Backdrop,
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Typography,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
// eslint-disable-next-line import/named
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useRecoilValue } from 'recoil';
import { useSWRConfig } from 'swr';
import AlertDialog from '../../components/AlertDialog';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCsrf from '../../hooks/useCsrf';
import useCurrentUser from '../../hooks/useCurrentUser';
import useFetchData from '../../hooks/useFetchData';
import useProtectedPaeg from '../../hooks/useProtectedPage';
import axios from '../../lib/axiosSetting';
import serversideAxios from '../../lib/axiosSettingServerside';

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

type TypeUserRelationList = {
  params: TypeUserRelation[];
};

const UserShowPage = ({ user }: { user: string }) => {
  useCurrentUser();
  useProtectedPaeg();
  useCsrf();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const { data: userRelationList, error: userRelationListIsError } =
    useFetchData<TypeUserRelationList>(`relation/user/${user}`);

  const onClickDeleteUser = async (user: string) => {
    setDialog(false);
    setLoading(true);
    try {
      await axios.delete(`user/delete/${user}`);
      mutate('user/index');
      router.push('/user/list');
      enqueueSnackbar('削除に成功しました', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('削除に失敗しました', { variant: 'error' });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const SpeedDialComponent = () => {
    const actions = [
      {
        icon: (
          <Link href={`/user/edit/${user}`} passHref>
            <FontAwesomeIcon icon={faUserEdit} size='lg' />
          </Link>
        ),
        name: 'パスワードの変更',
      },
      {
        icon: (
          <Link href={`/user/relation/${user}`} passHref>
            <FontAwesomeIcon icon={faMapMarkedAlt} size='lg' />
          </Link>
        ),
        name: '勤務地の編集',
      },
      {
        icon: (
          <div onClick={() => setDialog(true)}>
            <FontAwesomeIcon icon={faTrashAlt} size='lg' />
          </div>
        ),
        name: '削除',
      },
    ];
    return (
      <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
        <SpeedDial
          ariaLabel='SpeedDial basic example'
          sx={{ position: 'absolute', bottom: -200, right: 70 }}
          icon={<SpeedDialIcon />}
          direction='down'
        >
          {actions.map((action) => (
            <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} />
          ))}
        </SpeedDial>
      </Box>
    );
  };

  const Row = ({ data, index, style }: ListChildComponentProps<TypeUserRelation[]>) => {
    return (
      <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
        <Typography sx={{ fontSize: '1rem' }}>{data[index].workspot}</Typography>
      </div>
    );
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <AlertDialog
        msg={'本当に削除してよろしいですか？'}
        isOpen={dialog}
        doYes={async () => onClickDeleteUser(user)}
        doNo={() => {
          setDialog(false);
        }}
      />
      <Layout title='ミズホエンジニアリング | 社員詳細'>
        {isUserLoading ? (
          <CircularProgress />
        ) : !userInfo.role ? (
          <ErrorComponent></ErrorComponent>
        ) : userInfo.role !== 'admin' ? (
          <PermissionErrorComponent></PermissionErrorComponent>
        ) : (
          <>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: '3rem' }}>
              {user}
            </Typography>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SpeedDialComponent></SpeedDialComponent>
            </div>
            <Box sx={{ padding: '0 1rem', textAlign: 'center', marginTop: '2rem' }}>
              {!userRelationList ? (
                <CircularProgress />
              ) : userRelationListIsError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <List
                  className='List'
                  height={650}
                  width={'100%'}
                  itemCount={userRelationList.params.length}
                  itemData={userRelationList.params}
                  itemSize={80}
                >
                  {Row}
                </List>
              )}
            </Box>
          </>
        )}
      </Layout>
    </>
  );
};

export default UserShowPage;

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
