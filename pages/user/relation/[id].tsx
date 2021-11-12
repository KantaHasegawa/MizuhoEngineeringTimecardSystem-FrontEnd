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
import { Button, CircularProgress, Box, Grid, Pagination, Card, Typography } from "@mui/material";
import useAxios from "../../../hooks/useAxios";
import { mutate } from "swr";
import styles from '../../../styels/userRelationPage.module.scss'
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

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
    try {
      const params = {
        user: user,
        workspot: selectedOption.value,
      };
      await axios.post("relation/new", params);
      mutate(`relation/user/selectbox/${user}`);
      setSelectedOption(null)
    } catch (err) {
      console.log(err)
    }
  };

  const onDelete = async (workspot: string) => {
    try {
      const params = {
        user: user,
        workspot: workspot
      }
      await axios.post("relation/delete", params)
      mutate(`relation/user/selectbox/${user}`)
      setSelectedOption(null)
    } catch (err) {
      console.log(err)
    }
  }

  const Row = ({ data, index, style }: ListChildComponentProps<TypeUserRelation[]>) => {
    return (
      <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        <Typography sx={{ fontSize: "1rem" }}>{data[index].workspot}</Typography>
        <div onClick={async () => onDelete(data[index].workspot)} ><FontAwesomeIcon icon={faTrashAlt} size="lg" className={styles.trashIcon} /></div>
      </div>
    )
  }

  return (
    <Layout title="ミズホエンジニアリング | 社員詳細">
      <Box>
        {currentUserIsLoading ? (
          <CircularProgress />
        ) : currentUserIsError ? (
          <div>error</div>
        ) : currentUser.role !== "admin" ? (
          <div>You don't have permission</div>
        ) : (
          <>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>{user}</Typography>
            {!userSelectBoxResponse ? (
              <CircularProgress />
            ) : userSelectBoxResponseIsError ? (
              <div>has error</div>
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
