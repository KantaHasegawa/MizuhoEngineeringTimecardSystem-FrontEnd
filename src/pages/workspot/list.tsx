import { faSearch, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Tooltip,
  CircularProgress,
  TextField,
  Box,
  Paper,
  Grid,
  Pagination,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import router from 'next/router';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { accessTokenState } from '../../components/atoms';
import useCurrentUser from '../../hooks/useCurrentUser';
import useWorkspotList from '../../hooks/useWorkspotList';

const Item = styled(Paper)(({ theme }) => ({
  height: 80,
  margin: '1rem',
}));

const WorkspotListPage = () => {
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== 'admin'))
    router.push('/');
  const { state, workspotListState, setWorkspotListState } = useWorkspotList();
  const [inputState, setInputState] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const usersPerPage = 10;
  const pagesVisited = (pageNumber - 1) * usersPerPage;
  const pageCount = workspotListState ? Math.ceil(workspotListState.length / usersPerPage) : 0;

  const DisplayWorkspotList = ({ workspot }: { workspot: string }) => {
    return (
      <Box sx={{ cursor: 'pointer' }}>
        <Link href={`${workspot}`} passHref>
          <Item>
            <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{workspot}</Typography>
          </Item>
        </Link>
      </Box>
    );
  };

  const onChangeHandler = (event: any) => {
    const value = event.target.value;
    setInputState(value);
  };

  const onSearchHandler = (event: any) => {
    event.preventDefault();
    const value = inputState;
    const oldWorkspotList = state.data;
    let newWorkspotList = oldWorkspotList
      .map((item: string) => {
        if (item.includes(value)) return item;
      })
      .filter((item): item is string => {
        return item != undefined;
      });
    setWorkspotListState(newWorkspotList);
  };

  return (
    <Layout title='ミズホエンジニアリング | 勤務地リスト'>
      {currentUserIsLoading ? (
        <CircularProgress />
      ) : currentUserIsError ? (
        <ErrorComponent></ErrorComponent>
      ) : currentUser.role !== 'admin' ? (
        <PermissionErrorComponent></PermissionErrorComponent>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <form onSubmit={onSearchHandler}>
            <TextField
              id='outlined-basic'
              label='検索'
              variant='outlined'
              name='inputText'
              size='small'
              onChange={onChangeHandler}
            />
            <Tooltip title='検索'>
              <button type='submit' className="resetButton" onClick={onSearchHandler}>
                <FontAwesomeIcon className="icon" icon={faSearch} size='2x' />
              </button>
            </Tooltip>
            <Link href='/workspot/new' passHref>
              <Tooltip title='勤務地を追加'>
                <button type='button' className="resetButton">
                  <FontAwesomeIcon className="icon" icon={faPlusSquare} size='2x' />
                </button>
              </Tooltip>
            </Link>
          </form>
          {state.isLoading ? (
            <CircularProgress />
          ) : state.isError ? (
            <ErrorComponent></ErrorComponent>
          ) : (
            <>
              <Box sx={{ padding: '1rem' }}>
                {workspotListState
                  .slice(pagesVisited, pagesVisited + usersPerPage)
                  .map((item: string, index: number) => {
                    return <DisplayWorkspotList workspot={item} key={index}></DisplayWorkspotList>;
                  })}
              </Box>

              <Grid
                container
                direction='column'
                alignItems='center'
                justifyContent='center'
                sx={{ marginBottom: '2rem' }}
              >
                <Grid>
                  <Pagination
                    count={pageCount}
                    color='primary'
                    page={pageNumber}
                    onChange={(e, page) => setPageNumber(page)}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default WorkspotListPage;
