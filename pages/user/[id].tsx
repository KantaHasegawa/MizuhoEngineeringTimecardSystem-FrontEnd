import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from 'next/router';
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';
import React, { useState } from 'react'
import ReactPaginate from 'react-paginate'
import { getAllUserIDs } from '../../lib/userLibrary'
import { useSWRConfig } from 'swr'
import useAxios from "../../hooks/useAxios";
import Link from 'next/link'
import useUserRelationList from '../../hooks/useUserRelationList'
import { Button } from "@material-ui/core";

type TypeParams = {
  id: string
}

const UserShowPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig()
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  const { userRelationList, userRelationListIsError } = useUserRelationList(user);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const [pageNumber, setPageNumber] = useState(0);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;
  const pageCount = userRelationList ? Math.ceil(userRelationList.params.length / usersPerPage) : 0

  const onClickDeleteUser = async (user: string) => {
    try {
      await axios.delete(`user/delete/${user}`)
      mutate('user/index')
      router.push("/user/list")
    } catch (err) {
      console.log(err)
    }
  }

  const DisplayUserRelationList = ({ relation }: { relation: any }) => {
    return (
      <div className="user">
        <h3>{relation.workspot}</h3>
      </div>
    )
  }

  const changePage = ({ selected }: { selected: any }) => {
    setPageNumber(selected);
    getAllUserIDs();
  };

  return (
    <Layout title="ミズホエンジニアリング | 社員詳細">

      {currentUserIsLoading ? <div>loading</div>
        : currentUserIsError ? <div>error</div>
          : currentUser.role !== "admin" ? <div>You don't have permission</div>
            :
            <>
              <h1>{user}</h1>
              <Button onClick={async () => onClickDeleteUser(user)}>削除</Button>
              <Link href={`/user/edit/${user}`}>
                <a>パスワード変更</a>
              </Link>
              {
                !userRelationList ? <div>loading</div>
                  : userRelationListIsError ? <div>error</div>
                    :
                    <div>
                      <h3>登録済の勤務地</h3>
                      {
                        userRelationList?.params.slice(pagesVisited, pagesVisited + usersPerPage).map((relation, index) => {
                          return <DisplayUserRelationList relation={relation} key={index}></DisplayUserRelationList>
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

export const getStaticPaths = async () => {
  const paths = await getAllUserIDs();
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      user: params.id
    }
  }
}

export default UserShowPage;
