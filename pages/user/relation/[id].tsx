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
import { Button } from "@mui/material";
import useAxios from "../../../hooks/useAxios";
import { mutate } from "swr";

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

  const UserRelationList = ({ item }: { item: TypeUserRelation }) => {
    return (
      <div>
        {item.workspot}
        <Button variant="outlined" onClick={async() => onDelete(item.workspot)}>delete</Button>
      </div>
    )
  };

  return (
    <Layout title="ミズホエンジニアリング | 社員詳細">
      {currentUserIsLoading ? (
        <div>loading</div>
      ) : currentUserIsError ? (
        <div>error</div>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
      ) : (
        <>
          <div>{user}</div>
          {!userSelectBoxResponse ? (
            <div>loading</div>
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
              <Button variant="outlined" onClick={async() => onSubmit()}>登録</Button>
              <h3>登録済みの勤務地</h3>
              {userSelectBoxResponse &&
                userSelectBoxResponse.relations.map((item, index) => {
                  return (
                    <UserRelationList
                      item={item}
                      key={index}
                    ></UserRelationList>
                  );
                })}
            </div>
          )}
        </>
      )}
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
