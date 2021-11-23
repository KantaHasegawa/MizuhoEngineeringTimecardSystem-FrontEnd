import axios from 'axios';

type TypeUserID = {
  params: {
    id: string;
  };
};

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://backend:4000/api/v1/'
    : process.env.NEXT_PUBLIC_API_HOST;

const getAllUserIDs = async () => {
  const result = await axios.get<TypeUserID>(`${host}user/ids`);
  return result.data;
};

export default getAllUserIDs;
