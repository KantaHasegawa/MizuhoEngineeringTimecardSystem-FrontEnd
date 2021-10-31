import axios from 'axios'

type TypeUserID = {
  params: {
    id: string
  }
}

const getAllUserIDs = async () => {
  const result = await axios.get<TypeUserID>(`${process.env.NEXT_PUBLIC_API_HOST}user/ids`)
  return result.data
}

export default getAllUserIDs
