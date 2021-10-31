import  { useState, useEffect, useReducer } from "react";
import useAxios from "./useAxios";

type TypeUser = {
  params: {
    attendance: string;
    password: string;
    role: string;
    user: string;
  }[]
};

type TypeState = {
  isLoading: boolean;
  isError: boolean;
  data: string[];
};

type TypeFetchInitAction = {
  type: "FETCH_INIT",
}

type TypeFetchSuccessAction = {
  type: "FETCH_SUCCESS";
  payload: string[]
};

type TypeFetchFailureAction = {
  type: "FETCH_FAILURE";
};

type TypeAction = TypeFetchInitAction | TypeFetchSuccessAction | TypeFetchFailureAction

const dataFetchReducer = (state: TypeState, action: TypeAction) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const useUserList = () => {
  const axios = useAxios()
  const [userListState, setUserListState] = useState<string[]>(
    []
  );
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: []
  });
  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });

      try {
        const result = await axios.get<TypeUser>("user/index");
        const userArray = result.data.params.map((item) => {
          return (item.user)
        })
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: userArray });
          setUserListState(userArray)
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, []);

  return {state, userListState, setUserListState};
};

export default useUserList;
