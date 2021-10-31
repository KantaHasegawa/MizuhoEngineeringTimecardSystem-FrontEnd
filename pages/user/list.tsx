import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../components/atoms";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { Button, TextField } from "@mui/material";
import { useSWRConfig } from "swr";
import useAxios from "../../hooks/useAxios";
import Link from "next/link";
import useUserList from "../../hooks/useUserList";

const UserListPage = () => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");
  const { state, userListState, setUserListState } = useUserList();
  const [inputState, setInputState] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = userListState
    ? Math.ceil(userListState.length / usersPerPage)
    : 0;

  const DisplayUsers = ({ user }:{user: string}) => {
    return (
      <div className="user">
        <Link href={`${user}`}>
          <a>{user}</a>
        </Link>
      </div>
    );
  };

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  const onChangeHandler = (event: any) => {
    const value = event.target.value;
    setInputState(value);
  };

  const onSearchHandler = () => {
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
    <Layout title="ミズホエンジニアリング | 社員リスト">
      {currentUserIsLoading ? (
        <div>loading</div>
      ) : currentUserIsError ? (
        <div>error</div>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
      ) : (
        <>
          <TextField
            id="outlined-basic"
            label="検索"
            variant="outlined"
            name="inputText"
            onChange={onChangeHandler}
          />
          <Button variant="outlined" onClick={onSearchHandler}>
            検索
          </Button>
          {state.isLoading ? (
            <div>loading</div>
          ) : state.isError ? (
            <div>error</div>
          ) : (
            <div>
              <h1>User List</h1>
              {userListState
                .slice(pagesVisited, pagesVisited + usersPerPage)
                .map((item: string, index: number) => {
                  return <DisplayUsers user={item} key={index}></DisplayUsers>;
                })}

              <ReactPaginate
                previousLabel={"前"}
                nextLabel={"次"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={changePage}
                containerClassName={"pagination"}
                pageClassName={"pages pagination"}
                activeClassName={"active"}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default UserListPage;
