import { faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Tooltip,
  CircularProgress,
  TextField,
  Box,
  Paper,
  Stack,
  Pagination,
  Grid,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useSWRConfig } from 'swr';
import styles from '../../../styels/userList.module.css';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { accessTokenState } from '../../components/atoms';
import useAxios from '../../hooks/useAxios';
import useCurrentUser from '../../hooks/useCurrentUser';
import useUserList from '../../hooks/useUserList';

const Item = styled(Paper)(({ theme }) => ({
  height: 60,
  margin: '1rem',
}));

const UserListPage = () => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== 'admin'))
    router.push('/');
  const { state, userListState, setUserListState } = useUserList();
  const [inputState, setInputState] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const usersPerPage = 10;
  const pagesVisited = (pageNumber - 1) * usersPerPage;
  const pageCount = userListState ? Math.ceil(userListState.length / usersPerPage) : 0;

  const DisplayUsers = ({ user }: { user: string }) => {
    return (
      <Box sx={{ cursor: 'pointer' }}>
        <Link href={`${user}`} passHref>
          <Item>
            <h4>{user}</h4>
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
    const oldUserList = state.data;
    let newUserList = oldUserList
      .map((item: string) => {
        if (item.includes(value)) return item;
      })
      .filter((item): item is string => {
        return item != undefined;
      });
    setUserListState(newUserList);
  };

  return (
    <Layout title='ミズホエンジニアリング | 社員リスト'>
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
              onChange={onChangeHandler}
              size='small'
            />
            <Tooltip title='検索'>
              <button type='submit' className={styles.resetButton} onClick={onSearchHandler}>
                <FontAwesomeIcon className={styles.icon} icon={faSearch} size='2x' />
              </button>
            </Tooltip>
            <Link href='/auth/signup' passHref>
              <Tooltip title='社員を追加'>
                <button type='button' className={styles.resetButton}>
                  <FontAwesomeIcon className={styles.icon} icon={faUserPlus} size='2x' />
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
                {userListState
                  .slice(pagesVisited, pagesVisited + usersPerPage)
                  .map((item: string, index: number) => {
                    return <DisplayUsers user={item} key={index}></DisplayUsers>;
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

export default UserListPage;
