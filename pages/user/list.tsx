import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from 'next/router';
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';
import useUserList from '../../hooks/useUserList'
import React, { useState } from 'react'
import ReactPaginate from 'react-paginate'
import { Button } from "@material-ui/core";
import { getAllUserIDs } from '../../lib/userLibrary'
import { useSWRConfig } from 'swr'
import useAxios from "../../hooks/useAxios";
import Link from 'next/link'

const UserListPage = () => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig()
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const { userList, userListIsError } = useUserList();
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = userList ? Math.ceil(userList.params.length / usersPerPage) : 0




  const DisplayUsers = ({ user }: { user: any }) => {
    return (
      <div className="user">
        <Link href={`${user.user}`}>
        <a>{user.user}</a>
        </Link>
      </div>
    )
  }

  const changePage = ({ selected }: { selected: any }) => {
    setPageNumber(selected);
    getAllUserIDs();
  };

  return (
    <Layout title="ミズホエンジニアリング | 社員リスト">
      {currentUserIsLoading ? <div>loading</div>
        : currentUserIsError ? <div>error</div>
          : currentUser.role !== "admin" ? <div>You don't have permission</div>
            :
            <>
              {
                !userList ? <div>loading</div>
                  : userListIsError ? <div>error</div>
                    :
                    <div>
                      <h1>User List</h1>
                      {
                        userList?.params.slice(pagesVisited, pagesVisited + usersPerPage).map((user, index) => {
                          return <DisplayUsers user={user} key={index}></DisplayUsers>
                        })
                      }
                      <ReactPaginate
                        previousLabel={"前"}
                        nextLabel={"次"}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={changePage}
                        containerClassName={"pagination"}
                        pageClassName={"pages pagination"}
                        activeClassName={"active"} />
                    </div>
              }
            </>
      }
    </Layout>
  )
}

export default UserListPage;
