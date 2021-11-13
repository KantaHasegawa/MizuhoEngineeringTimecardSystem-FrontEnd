import Layout from "../../components/Layout";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../components/atoms";
import React, { useState } from "react";
import { useSWRConfig } from "swr";
import useAxios from "../../hooks/useAxios";
import Link from "next/link";
import useWorkspotRelationList, { TypeWorkspotRelation } from "../../hooks/useWorkspotRelationList";
import { Button, CircularProgress, Grid, Pagination, Box, SpeedDial, SpeedDialIcon, SpeedDialAction, Paper, Typography } from "@mui/material";
import {useSnackbar} from 'notistack'
import getAllWorkspotIDs from '../../lib/getAllWorkspotIDs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserEdit, faCalendarAlt, faUsers, faSignInAlt, faSignOutAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

type TypeParams = {
  id: string;
};

const WorkspotShowPage = ({ workspot }: { workspot: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const { mutate } = useSWRConfig();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  const { workspotRelationList, workspotRelationListIsError } =
    useWorkspotRelationList(workspot);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");

  const onClickDeleteWorkspot = async (workspot: string) => {
    const params = {
      workspot: workspot,
      attendance: `workspot ${workspot}`
    }
    try {
      await axios.post(`workspot/delete`, params);
      mutate("workspot/index");
      router.push("/workspot/list");
      enqueueSnackbar("削除に成功しました", {variant: "success"})
    } catch (err) {
      enqueueSnackbar("削除に失敗しました", { variant: "error" })
      console.log(err);
    }
  };

  const SpeedDialComponent = () => {
    const actions = [
      {
        icon: <Link href={`/workspot/relation/${workspot}`}><FontAwesomeIcon icon={faUsers} size="lg" /></Link>, name: '紐づけられた社員の編集'
      },
      { icon: <div onClick={async () => onClickDeleteWorkspot(workspot)}><FontAwesomeIcon icon={faTrashAlt} size="lg" /></div>, name: '削除' },
    ];
    return (
      <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          sx={{ position: 'absolute', bottom: -155, right: 30 }}
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

  const Row = ({ data, index, style }: ListChildComponentProps<TypeWorkspotRelation[]>) => {
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <Typography sx={{ fontSize: "1rem" }}>{data[index].user}</Typography>
      </div>
    )
  }

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
          <Box sx={{width: "23rem"}}>
            <Typography sx={{ fontSize: "1rem", fontWeight: "bold", marginLeft: "1rem" }} >{workspot}</Typography>
          </Box>
          <div style={{ position: "relative", zIndex: 1 }}>
            <SpeedDialComponent></SpeedDialComponent>
          </div>
          <Box sx={{ padding: "0 1rem", textAlign: "center", marginTop: "2rem" }}>
            {!workspotRelationList ? (
              <CircularProgress />
            ) : workspotRelationListIsError ? (
              <div>error</div>
            ) : (
              <List
                className="List"
                height={650}
                width={"100%"}
                itemCount={workspotRelationList.params.length}
                itemData={workspotRelationList.params}
                itemSize={45}
              >
                {Row}
              </List>
            )}
          </Box>
        </>
      )
      }
    </Layout >
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
