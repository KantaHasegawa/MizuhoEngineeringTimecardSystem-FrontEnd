import { BackdropProps } from "@material-ui/core";
import { useEffect, useReducer, useState } from "react";
import useAxios from './useAxios'

type TypeWorkspot = {
  workspot: string,
}

type TypeWorkspotAndDelete = {
  workspot: string,
  delete: boolean,
  new: boolean
}

type TypeUserRelationIndexNameOnlyResponse = {
  workspots: TypeWorkspot[],
  workspotsAndDelete: TypeWorkspotAndDelete[]
}

type TypeSelectBoxItems = {
  value: TypeWorkspot,
  label: TypeWorkspot
} | undefined

const dataFetchReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const useUserRelationEdit = (user: string) => {
  const axios = useAxios();
  const [selectBoxItems, setSelectBoxItems] = useState<TypeSelectBoxItems[]>([])
  const [selectedItems, setSelectedItems] = useState<TypeWorkspotAndDelete[]>([])
  const [reload, setReload] = useState(false)

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const userRelationResponse = await axios.get<TypeUserRelationIndexNameOnlyResponse>(`user/relation/indexnameonly/${user}`);
        const workspots = await axios.get<{ params: TypeWorkspot[] }>("workspot/indexnameonly")
        const selectBoxItems = workspots.data.params.map((item) => {
          if (!userRelationResponse.data.workspots.includes(item)) {
            return (
              {
                label: item,
                value: item
              }
            )
          }
        }).filter((item) => item)
        setSelectBoxItems(selectBoxItems)
        setSelectedItems(userRelationResponse.data.workspotsAndDelete)

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS'});
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [reload]);

  return [state, selectBoxItems, setSelectBoxItems, selectedItems, setSelectedItems, reload, setReload];
};

export default useUserRelationEdit;
