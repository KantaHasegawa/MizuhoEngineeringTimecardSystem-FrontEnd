import axios from 'axios';

type TypeWorkspotID = {
  params: {
    id: string;
  };
};

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://backend:4000/api/v1/'
    : process.env.NEXT_PUBLIC_API_HOST;

const getWorkspotAllIDs = async () => {
  const result = await axios.get<TypeWorkspotID>(`${host}workspot/ids`);
  return result.data;
};

export default getWorkspotAllIDs;
