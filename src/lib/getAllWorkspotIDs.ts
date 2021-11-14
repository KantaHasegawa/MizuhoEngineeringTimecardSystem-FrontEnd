import axios from "axios";

type TypeWorkspotID = {
  params: {
    id: string;
  };
};

const getWorkspotAllIDs = async () => {
  const result = await axios.get<TypeWorkspotID>(
    `${process.env.NEXT_PUBLIC_API_HOST}workspot/ids`
  );
  return result.data;
};

export default getWorkspotAllIDs;
