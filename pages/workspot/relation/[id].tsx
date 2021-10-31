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
import { Button } from "@material-ui/core";
import useAxios from "../../../hooks/useAxios";
import { mutate } from "swr";

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
    } catch (err) {
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
    } catch (err) {
      console.log(err);
    }
  };

  const UserRelationList = ({ item }: { item: TypeWorkspotRelation }) => {
    return (
      <div>
        {item.user}
        <Button variant="outlined" onClick={async () => onDelete(item.user)}>
          delete
        </Button>
      </div>
    );
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
          <div>{workspot}</div>
          {!workspotSelectBoxResponse ? (
            <div>loading</div>
          ) : workspotSelectBoxResponseIsError ? (
            <div>has error</div>
          ) : (
            <div>
              <Select
                defaultValue={selectedOption}
                value={selectedOption}
                onChange={setSelectedOption}
                options={workspotSelectBoxResponse.selectBoxItems}
                isClearable={true}
              />
              <Button variant="outlined" onClick={async () => onSubmit()}>
                登録
              </Button>
              <h3>登録済みの勤務地</h3>
              {workspotSelectBoxResponse &&
                workspotSelectBoxResponse.relations.map((item, index) => {
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
