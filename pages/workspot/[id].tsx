import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../components/atoms";
import React, { useState } from "react";
import { useSWRConfig } from "swr";
import useAxios from "../../hooks/useAxios";
import Link from "next/link";
import useWorkspotRelationList from "../../hooks/useWorkspotRelationList";
import { Button, CircularProgress, Grid, Pagination} from "@mui/material";
import getAllWorkspotIDs from '../../lib/getAllWorkspotIDs'

type TypeParams = {
  id: string;
};

const WorkspotShowPage = ({ workspot }: { workspot: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  const { workspotRelationList, workspotRelationListIsError } =
    useWorkspotRelationList(workspot);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");
  const [pageNumber, setPageNumber] = useState(1);
  const workspotsPerPage = 10;
  const pagesVisited = (pageNumber - 1) * workspotsPerPage;
  const pageCount = workspotRelationList
    ? Math.ceil(workspotRelationList.params.length / workspotsPerPage)
    : 0;

  const onClickDeleteWorkspot = async (workspot: string) => {
    const params = {
      workspot: workspot,
      attendance: `workspot ${workspot}`
    }
    try {
      await axios.post(`workspot/delete`, params);
      mutate("workspot/index");
      router.push("/workspot/list");
    } catch (err) {
      console.log(err);
    }
  };

  const DisplayWorkspotRelationList = ({ relation }: { relation: any }) => {
    return (
      <div className="workspot">
        <h3>{relation.user}</h3>
      </div>
    );
  };

  return (
    <Layout title="ミズホエンジニアリング | 勤務地詳細">
      {currentUserIsLoading ? (
        <CircularProgress />
      ) : currentUserIsError ? (
        <div>error</div>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
      ) : (
        <>
          <h1>{workspot}</h1>
          <Button onClick={async () => onClickDeleteWorkspot(workspot)}>削除</Button>
          {!workspotRelationList ? (
            <CircularProgress />
          ) : workspotRelationListIsError ? (
            <div>error</div>
          ) : (
            <div>
              <h3>登録済みの社員</h3>
              <Link href={`/workspot/relation/${workspot}`}>
                <a>紐付けられた社員の編集</a>
              </Link>
              {workspotRelationList?.params
                .slice(pagesVisited, pagesVisited + workspotsPerPage)
                .map((relation, index) => {
                  return (
                    <DisplayWorkspotRelationList
                      relation={relation}
                      key={index}
                    ></DisplayWorkspotRelationList>
                  );
                })}
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
          )}
        </>
      )}
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const paths = await getAllWorkspotIDs();
  return {
    paths,
    fallback: false,
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
