import { useState, useEffect, useReducer } from 'react';
import axios from '../lib/axiosSetting';

type TypeWorkspot = {
  params: {
    workspot: string;
    user: string;
    attendance: string;
    latitude: number;
    longitude: number;
  }[];
};

type TypeState = {
  isLoading: boolean;
  isError: boolean;
  data: string[];
};

type TypeFetchInitAction = {
  type: 'FETCH_INIT';
};

type TypeFetchSuccessAction = {
  type: 'FETCH_SUCCESS';
  payload: string[];
};

type TypeFetchFailureAction = {
  type: 'FETCH_FAILURE';
};

type TypeAction = TypeFetchInitAction | TypeFetchSuccessAction | TypeFetchFailureAction;

const dataFetchReducer = (state: TypeState, action: TypeAction) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
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

const useWorkspotList = () => {
  const [workspotListState, setWorkspotListState] = useState<string[]>([]);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: [],
  });
  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await axios.get<TypeWorkspot>('workspot/index');
        const workspotArray = result.data.params.map((item) => {
          return item.workspot;
        });
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: workspotArray });
          setWorkspotListState(workspotArray);
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
  }, []);

  return { state, workspotListState, setWorkspotListState };
};

export default useWorkspotList;
