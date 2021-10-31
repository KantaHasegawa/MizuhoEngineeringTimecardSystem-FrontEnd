import React, { useState } from "react";
import { Button, TextField } from "@material-ui/core";
import useCurrentUser from "../../hooks/useCurrentUser";
import Layout from "../../components/Layout";
import { accessTokenState } from "../../components/atoms";
import { useRecoilValue } from "recoil";
import router from "next/router";
import useWorkspotList from "../../hooks/useWorkspotList";
import ReactPaginate from "react-paginate";
import Link from "next/link";

const WorkspotListPage = () => {
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");
  const { state, workspotListState, setWorkspotListState } = useWorkspotList();
  const [inputState, setInputState] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = workspotListState
    ? Math.ceil(workspotListState.length / usersPerPage)
    : 0;

  const DisplayWorkspotList = ({ workspot }: { workspot: string }) => {
    return (
      <div className="workspot">
        <Link href={`${workspot}`}>
          <a>{workspot}</a>
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
    <Layout title="ミズホエンジニアリング | 勤務地リスト">
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
          <br />
          <Link href="new">
            <a>勤務地を追加</a>
          </Link>
          {state.isLoading ? (
            <div>loading</div>
          ) : state.isError ? (
            <div>error</div>
          ) : (
            <div>
              <h1>Workspot List</h1>
              {workspotListState
                .slice(pagesVisited, pagesVisited + usersPerPage)
                .map((item: string, index: number) => {
                  return (
                    <DisplayWorkspotList
                      workspot={item}
                      key={index}
                    ></DisplayWorkspotList>
                  );
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

export default WorkspotListPage;
