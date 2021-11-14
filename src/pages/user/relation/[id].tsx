import Layout from "../../../components/Layout";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../../components/atoms";
import React, { useState } from "react";
import getAllUserIDs from "../../../lib/getAllUserIDs";
import useUserRelationEdit, {
  TypeUserRelation,
} from "../../../hooks/useUserRelationEdit";
import Select from "react-select";
import { Button, CircularProgress, Box, Tooltip, Typography, Backdrop } from "@mui/material";
import { useSnackbar } from 'notistack';
import useAxios from "../../../hooks/useAxios";
import { mutate } from "swr";
import styles from '../../../../styels/userRelationPage.module.css';
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import ErrorComponent from "../../../components/ErrorComponent";

type TypeParams = {
  id: string;
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const UserRelationEditPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const axios = useAxios();
  const accessToken = useRecoilValue(accessTokenState);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<TypeSelectedOption>(null);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");

  const { userSelectBoxResponse, userSelectBoxResponseIsError } =
    useUserRelationEdit(user);

  const onSubmit = async () => {
    if (!selectedOption?.value) return;
    setLoading(true);
    try {
      const params = {
        user: user,
        workspot: selectedOption.value,
      };
      await axios.post("relation/new", params);
      mutate(`relation/user/selectbox/${user}`);
      setSelectedOption(null);
      enqueueSnackbar("登録に成功しました", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("登録に失敗しました", { variant: "error" });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (workspot: string) => {
    setLoading(true);
    try {
      const params = {
        user: user,
        workspot: workspot
      };
      await axios.post("relation/delete", params);
      mutate(`relation/user/selectbox/${user}`);
      setSelectedOption(null);
      enqueueSnackbar("削除に成功しました", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("削除に失敗しました", { variant: "error" });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ data, index, style }: ListChildComponentProps<TypeUserRelation[]>) => {
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <Typography sx={{ fontSize: "1rem" }}>{data[index].workspot}</Typography>
        <Tooltip title="削除" placement="left-start">
          <div onClick={async () => onDelete(data[index].workspot)} >
            <FontAwesomeIcon icon={faTrashAlt} size="lg" className={styles.trashIcon} />
          </div>
        </Tooltip>
      </div>
    );
  };

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
              <Typography sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>{user}</Typography>
              {!userSelectBoxResponse ? (
                <CircularProgress />
              ) : userSelectBoxResponseIsError ? (
                <ErrorComponent></ErrorComponent>
              ) : (
                <div>
                  <Select
                    defaultValue={selectedOption}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={userSelectBoxResponse.selectBoxItems}
                    isClearable={true}
                  />
                  <Box sx={{ textAlign: "center", margin: "1rem" }}>
                    <Button className={styles.button} variant="outlined" onClick={async () => onSubmit()}>登録</Button>
                  </Box>
                  {userSelectBoxResponse.relations &&
                    <List
                      className="List"
                      height={650}
                      width={"100%"}
                      itemCount={userSelectBoxResponse.relations.length}
                      itemData={userSelectBoxResponse.relations}
                      itemSize={80}
                    >
                      {Row}
                    </List>}

                </div>
              )}
            </>
          )}
        </Box>
      </Layout>
    </>
  );
};

export const getStaticPaths = async () => {
  const paths = await getAllUserIDs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: TypeParams }) => {
  return {
    props: {
      user: params.id,
    },
  };
};

export default UserRelationEditPage;
