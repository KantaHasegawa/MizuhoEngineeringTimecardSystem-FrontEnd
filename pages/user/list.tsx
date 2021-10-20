import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from 'next/router';
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';
import useUserList from '../../hooks/useUserList'
import React, { useState } from 'react'
import ReactPaginate from 'react-paginate'

const UserListPage = () => {
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const { userList, userListIsError } = useUserList();
  const [pageNumber, setPageNumber] = useState(0);

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = userList ? Math.ceil(userList.users.length / usersPerPage) : 0

  const DisplayUsers = ({ user }: {user:any}) => {
    return (
        <div className="user">
          <h3>{user.user}</h3>
        </div>
    )
  }

  const changePage = ({ selected }: {selected: any}) => {
    setPageNumber(selected);
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
                        userList?.users.slice(pagesVisited, pagesVisited + usersPerPage).map((user, index) => {
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
