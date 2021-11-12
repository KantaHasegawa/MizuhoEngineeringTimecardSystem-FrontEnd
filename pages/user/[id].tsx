import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from 'next/router';
import { useRecoilValue } from "recoil";
import { accessTokenState } from '../../components/atoms';
import React, { useState } from 'react'
import getAllUserIDs from '../../lib/getAllUserIDs'
import { useSWRConfig } from 'swr'
import useAxios from "../../hooks/useAxios";
import Link from 'next/link'
import useUserRelationList from '../../hooks/useUserRelationList'
import { Button, CircularProgress, Grid, Pagination, Box, SpeedDial, SpeedDialIcon, SpeedDialAction, Paper, Typography } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserEdit, faCalendarAlt, faMapMarkedAlt, faSignInAlt, faSignOutAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { styled } from "@mui/system";

type TypeParams = {
  id: string
}

const Item = styled(Paper)(({ theme }) => ({
  height: 60,
  lineHeight: '60px',
  margin: "1rem",
}));

const UserShowPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig()
  const accessToken = useRecoilValue(accessTokenState)
  const { currentUser, currentUserIsLoading, currentUserIsError } = useCurrentUser(accessToken);
  const { userRelationList, userRelationListIsError } = useUserRelationList(user);
  if ((!currentUserIsLoading && !currentUser) || (currentUser && currentUser.role !== "admin")) router.push("/")
  const [pageNumber, setPageNumber] = useState(1);
  const usersPerPage = 10;
  const pagesVisited = (pageNumber - 1) * usersPerPage;
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

  const SpeedDialComponent = () => {
    const actions = [
      {
        icon: <Link href={`/user/edit/${user}`}><FontAwesomeIcon icon={faUserEdit} size="lg" /></Link>, name: 'パスワードの変更'
      },
      {
        icon: <Link href={`/user/relation/${user}`}><FontAwesomeIcon icon={faMapMarkedAlt} size="lg" /></Link>, name: '勤務地の編集'
      },
      { icon: <div onClick={async () => onClickDeleteUser(user)}><FontAwesomeIcon icon={faTrashAlt} size="lg" /></div>, name: '削除' },
    ];
    return (
      <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          sx={{ position: 'absolute', bottom: -200, right: 70 }}
          icon={<SpeedDialIcon />}
          direction="down"
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
            />
          ))}
        </SpeedDial>
      </Box>
    )
  }

  const DisplayUserRelationList = ({ relation }: { relation: any }) => {
    return (
      <Box className="user">
        <Item><h4>{relation.workspot}</h4></Item>
      </Box>
    )
  }

  return (
    <Layout title="ミズホエンジニアリング | 社員詳細">

      {currentUserIsLoading ? <CircularProgress />
        : currentUserIsError ? <div>error</div>
          : currentUser.role !== "admin" ? <div>You don't have permission</div>
            :
            <>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: "bold", marginLeft: "3rem"}} >{user}</Typography>
              <SpeedDialComponent></SpeedDialComponent>
              <Box sx={{ padding: "0 1rem", textAlign: "center" }}>
                {
                  !userRelationList ? <CircularProgress />
                    : userRelationListIsError ? <div>error</div>
                      :
                      <div>
                        {
                          userRelationList?.params.slice(pagesVisited, pagesVisited + usersPerPage).map((relation, index) => {
                            return <DisplayUserRelationList relation={relation} key={index}></DisplayUserRelationList>
                          })
                        }
                        <Grid
                          container
                          direction="column"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Grid>
                            <Pagination count={pageCount} color="primary" page={pageNumber} onChange={(e, page) => setPageNumber(page)} />
                          </Grid>
                        </Grid>
                      </div>
                }
              </Box>
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
