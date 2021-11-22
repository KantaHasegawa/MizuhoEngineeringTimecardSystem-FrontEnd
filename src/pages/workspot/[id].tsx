import { faUsers, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  CircularProgress,
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Backdrop,
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
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCsrf from '../../hooks/useCsrf';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';
import useWorkspotRelationList, { TypeWorkspotRelation } from '../../hooks/useWorkspotRelationList';
import axios from '../../lib/axiosSetting';
import getAllWorkspotIDs from '../../lib/getAllWorkspotIDs';

type TypeParams = {
  id: string;
};

const WorkspotShowPage = ({ workspot }: { workspot: string }) => {
  useCurrentUser();
  useProtectedPage();
  useCsrf();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const { workspotRelationList, workspotRelationListIsError } = useWorkspotRelationList(workspot);

  const onClickDeleteWorkspot = async (workspot: string) => {
    setLoading(true);
    const params = {
      workspot: workspot,
      attendance: `workspot ${workspot}`,
    };
    try {
      await axios.post(`workspot/delete`, params);
      mutate('workspot/index');
      router.push('/workspot/list');
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
          <Link href={`/workspot/relation/${workspot}`} passHref>
            <FontAwesomeIcon icon={faUsers} size='lg' />
          </Link>
        ),
        name: '紐づけられた社員の編集',
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
          sx={{ position: 'absolute', bottom: -155, right: 30 }}
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

  const Row = ({ data, index, style }: ListChildComponentProps<TypeWorkspotRelation[]>) => {
    return (
      <div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>
        <Typography sx={{ fontSize: '1rem' }}>{data[index].user}</Typography>
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
        doYes={async () => onClickDeleteWorkspot(workspot)}
        doNo={() => {
          setDialog(false);
        }}
      />
      <Layout title='ミズホエンジニアリング | 勤務地詳細'>
        {isUserLoading ? (
          <CircularProgress />
        ) : !userInfo.role ? (
          <ErrorComponent></ErrorComponent>
        ) : userInfo.role !== 'admin' ? (
          <PermissionErrorComponent></PermissionErrorComponent>
        ) : (
          <>
            <Box sx={{ width: '23rem' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', marginLeft: '1rem' }}>
                {workspot}
              </Typography>
            </Box>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SpeedDialComponent></SpeedDialComponent>
            </div>
            <Box sx={{ padding: '0 1rem', textAlign: 'center', marginTop: '2rem' }}>
              {!workspotRelationList ? (
                <CircularProgress />
              ) : workspotRelationListIsError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <List
                  className='List'
                  height={650}
                  width={'100%'}
                  itemCount={workspotRelationList.params.length}
                  itemData={workspotRelationList.params}
                  itemSize={45}
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
  const paths = await getAllWorkspotIDs();
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      workspot: params.id,
    },
  };
};

export default WorkspotShowPage;
