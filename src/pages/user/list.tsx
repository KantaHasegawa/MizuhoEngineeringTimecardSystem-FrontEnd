import { faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, CircularProgress, TextField, Box, Paper, Pagination, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import ErrorComponent from '../../components/ErrorComponent';
import Layout from '../../components/Layout';
import PermissionErrorComponent from '../../components/PermissionErrorComponent';
import { isUserLoadingState, userInfoState } from '../../components/atoms';
import useCurrentUser from '../../hooks/useCurrentUser';
import useProtectedPage from '../../hooks/useProtectedPage';
import useUserList from '../../hooks/useUserList';

const Item = styled(Paper)(({ theme }) => ({
  height: 60,
  margin: '1rem',
}));

const UserListPage = () => {
  useCurrentUser();
  useProtectedPage();
  const isUserLoading = useRecoilValue(isUserLoadingState);
  const userInfo = useRecoilValue(userInfoState);
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
      {isUserLoading ? (
        <CircularProgress />
      ) : !userInfo.role ? (
        <ErrorComponent></ErrorComponent>
      ) : userInfo.role !== 'admin' ? (
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
                sx={{width: "10rem"}}
              />
            <Tooltip title='検索'>
              <button type='submit' className='resetButton' onClick={onSearchHandler}>
                <FontAwesomeIcon className='icon' icon={faSearch} size='2x' />
              </button>
            </Tooltip>
            <Link href='/auth/signup' passHref>
              <Tooltip title='社員を追加'>
                <button type='button' className='resetButton'>
                  <FontAwesomeIcon className='icon' icon={faUserPlus} size='2x' />
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
                    siblingCount={0}
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
