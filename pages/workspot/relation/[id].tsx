import Layout from "../../../components/Layout";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../../components/atoms";
import React, { useState } from "react";
import getAllWorkspotIDs from "../../../lib/getAllWorkspotIDs";
import useWorkspotRelationEdit, {
  TypeWorkspotRelation,
} from "../../../hooks/useWorkspotRelationEdit";
import Select from "react-select";
import { Button, CircularProgress, Box, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from 'notistack'
import useAxios from "../../../hooks/useAxios";
import { mutate } from "swr";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import styles from '../../../styels/workspotRelationPage.module.scss'
import ErrorComponent from "../../../components/ErrorComponent";

type TypeParams = {
  id: string;
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const WorkspotRelationEditPage = ({ workspot }: { workspot: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedOption, setSelectedOption] =
    useState<TypeSelectedOption>(null);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");

  const { workspotSelectBoxResponse, workspotSelectBoxResponseIsError } =
    useWorkspotRelationEdit(workspot);

  const onSubmit = async () => {
    if (!selectedOption?.value) return;
    try {
      const params = {
        user: selectedOption.value,
        workspot: workspot,
      };
      await axios.post("relation/new", params);
      mutate(`relation/workspot/selectbox/${workspot}`);
      setSelectedOption(null);
      enqueueSnackbar("登録に成功しました", { variant: "success" })
    } catch (err) {
      enqueueSnackbar("登録に失敗しました", { variant: "error" })
      console.log(err);
    }
  };

  const onDelete = async (user: string) => {
    try {
      const params = {
        user: user,
        workspot: workspot,
      };
      await axios.post("relation/delete", params);
      mutate(`relation/workspot/selectbox/${workspot}`);
      setSelectedOption(null);
      enqueueSnackbar("削除に成功しました", { variant: "success" })
    } catch (err) {
      enqueueSnackbar("削除に失敗しました", { variant: "error" })
      console.log(err);
    }
  };

  const Row = ({ data, index, style }: ListChildComponentProps<TypeWorkspotRelation[]>) => {
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <Typography sx={{ fontSize: "1rem" }}>{data[index].user}</Typography>
        <Tooltip title="削除" placement="left-start">
          <div onClick={async () => onDelete(data[index].user)} >
            <FontAwesomeIcon icon={faTrashAlt} size="lg" className={styles.trashIcon} />
          </div>
        </Tooltip>
      </div>
    )
  }

  return (
    <Layout title="ミズホエンジニアリング | 編集">
      <Box>
        {currentUserIsLoading ? (
          <CircularProgress />
        ) : currentUserIsError ? (
          <ErrorComponent></ErrorComponent>
        ) : currentUser.role !== "admin" ? (
          <div>You don't have permission</div>
        ) : (
          <>
            <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>{workspot}</Typography>
            {!workspotSelectBoxResponse ? (
              <CircularProgress />
            ) : workspotSelectBoxResponseIsError ? (
              <ErrorComponent></ErrorComponent>
            ) : (
              <div>
                <Select
                  defaultValue={selectedOption}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  options={workspotSelectBoxResponse.selectBoxItems}
                  isClearable={true}
                />
                <Box sx={{ textAlign: "center", margin: "1rem" }}>
                  <Button className={styles.button} variant="outlined" onClick={async () => onSubmit()}>登録</Button>
                </Box>
                {workspotSelectBoxResponse &&
                  <List
                    className="List"
                    height={650}
                    width={"100%"}
                    itemCount={workspotSelectBoxResponse.relations.length}
                    itemData={workspotSelectBoxResponse.relations}
                    itemSize={80}
                  >
                    {Row}
                  </List>
                }
              </div>
            )}
          </>
        )}
      </Box>
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

export default WorkspotRelationEditPage;
