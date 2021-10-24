import Layout from "../../../components/Layout";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../../components/atoms";
import React, { useEffect, useState } from "react";
import { getAllUserIDs } from "../../../lib/userLibrary";
import useDataAPI from "../../../hooks/useDataAPI";
import useUserRelationEdit from "../../../hooks/useUserRelationEdit";
import Select from "react-select";
import { Button } from "@material-ui/core";

type TypeParams = {
  id: string;
};

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const UserShowPage = ({ user }: { user: string }) => {
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");
  const [
    state,
    selectBoxItems,
    setSelectBoxItems,
    selectedItems,
    setSelectedItems,
    reload,
    setReload
  ] = useUserRelationEdit(user);
  const [selectedOption, setSelectedOption] =
    useState<TypeSelectedOption>(null);

  const SelectedItemsComponent = ({ item }: { item: any }) => {
    return (
      <div>
        {item.workspot}
        {item.new ? <Button variant="outlined">cancel</Button> : <p>it's old item</p>}
      </div>
    )
  };

  const onClickAddItem = () => {
    //selectedOptionをオブジェクト化してselectedItemsに追加
    if (!selectedOption) return;
    const addItem = {
      workspot: selectedOption.value,
      delete: false,
      new: true
    };
    setSelectedItems([...selectedItems, addItem]);
    //selectBoxiTemsから削除
    const newArray = selectBoxItems.filter(
      (item: any) => item.value !== selectedOption.value
    );
    setSelectBoxItems(newArray);
    //selecredoptionにnullを代入
    setSelectedOption(null);
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
          {state.isLoading ? (
            <div>loading</div>
          ) : state.isError ? (
            <div>error</div>
          ) : (
            <div>
              <div>
                <h3>選択する</h3>
                {selectBoxItems ? (
                  <Select
                    defaultValue={selectedOption}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    options={selectBoxItems}
                    isClearable={true}
                  />
                ) : (
                  <div>loading</div>
                )}
                <Button
                  variant="outlined"
                  disabled={!selectedOption}
                  onClick={onClickAddItem}
                >
                  追加
                </Button>
              </div>
              <div>
                <h3>選択済み</h3>
                {selectedItems.map((item: any, index: any) => {
                  return (
                    <SelectedItemsComponent
                      item={item}
                      key={index}
                    ></SelectedItemsComponent>
                  );
                })}
              </div>
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

export default UserShowPage;
