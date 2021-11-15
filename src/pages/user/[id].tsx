import {
  faUserEdit,
  faMapMarkedAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
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
import { accessTokenState } from '../../components/atoms';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser';
import useUserRelationList, { TypeUserRelation } from '../../hooks/useUserRelationList';
import getAllUserIDs from '../../lib/getAllUserIDs';

type TypeParams = {
  id: string;
};

const UserShowPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();
  const accessToken = useRecoilValue(accessTokenState);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  const { userRelationList, userRelationListIsError } = useUserRelationList(user);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== 'admin'))
    router.push('/');

  const onClickDeleteUser = async (user: string) => {
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
        {currentUserIsLoading ? (
          <CircularProgress />
        ) : currentUserIsError ? (
          <ErrorComponent></ErrorComponent>
        ) : currentUser.role !== 'admin' ? (
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

export const getStaticPaths = async () => {
  const paths = await getAllUserIDs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      user: params.id,
    },
  };
};

export default UserShowPage;