import axios from '../lib/axiosSetting';

const fetcher = async (url: string): Promise<any> => {
  const res = await axios.get(url);
  return res.data;
};

export default fetcher;
