import { Button } from "@material-ui/core";
import useGetLatestTimecard, { TypeTimecard } from '../hooks/useGetLatestTimecard'
import useUserRelationList from '../hooks/useUserRelationList'
import "dayjs/locale/ja"
import dayjs from "dayjs";
import useAxios from "../hooks/useAxios";
import { mutate } from "swr";
import { useState } from "react";
import { TypeUserRelation } from "../hooks/useUserRelationList";
import { CircularProgress } from "@mui/material";
dayjs.locale("ja")

type TypeCurrentUser = {
  name: string,
  role: string
}

type TypeTimecardStatus = "NotAttend" | "NotLeave" | "AlreadyLeave"

const isTimecardStatus = (timecard: TypeTimecard): TypeTimecardStatus => {
  const today = dayjs().format('YYYYMMDD')
  const result =
    timecard.leave === 'none' ? "NotLeave"
      : timecard.attendance.slice(0, 8) === today ? "AlreadyLeave"
        : "NotAttend"
  return result
}

const CommonPage = ({ user }: { user: TypeCurrentUser }) => {
  const axios = useAxios()
  const [loading, setLoading] = useState(false)
  const { latestTimecard, latestTimecardIsError } = useGetLatestTimecard(user.name)
  const { userRelationList, userRelationListIsError } = useUserRelationList(user.name)

  const onClickHandler = async () => {
    setLoading(true)
    if (!navigator.geolocation) {
      alert("お使いのブラウザは対応しておりません")
      return
    }
    navigator.geolocation.getCurrentPosition(getCurrentPositionSuccessFunction);
  }

  const getCurrentPositionSuccessFunction = async (position: GeolocationPosition) => {
    const params = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    }
    try {
      await axios.post("timecard/common", params)
      mutate(`timecard/latest/${user.name}`)
      mutate(`timecard/latestall`)
      alert("success")
    } catch (err) {
      console.log(err)
      alert("failed")
    } finally {
      setLoading(false)
    }
  }

  const MainContents = () => {
    return (
      !latestTimecard ? (
        <CircularProgress />
      ) : latestTimecardIsError ? (
        <div>error</div>
      ) : isTimecardStatus(latestTimecard) === "NotAttend" ? (
        <div>
          <div>not attend</div>
          <Button variant="outlined" disabled={loading} onClick={async () => onClickHandler()}>出勤</Button>
        </div>
      ) : isTimecardStatus(latestTimecard) === "NotLeave" ? (
        <div>
          <div>not leave</div>
          <p>出勤時刻: {`${latestTimecard.attendance.slice(4, 6)}月${latestTimecard.attendance.slice(6, 8)}日${latestTimecard.attendance.slice(8, 10)}時${latestTimecard.attendance.slice(10, 12)}分`}</p>
          <Button variant="outlined" disabled={loading} onClick={async () => onClickHandler()}>退勤</Button>
        </div>
      ) : (
        <div>
          <div>already leave</div>
          <p>出勤時刻: {`${latestTimecard.attendance.slice(4, 6)}月${latestTimecard.attendance.slice(6, 8)}日${latestTimecard.attendance.slice(8, 10)}時${latestTimecard.attendance.slice(10, 12)}分`}</p>
          <p>退勤時刻: {`${latestTimecard.leave.slice(4, 6)}月${latestTimecard.leave.slice(6, 8)}日${latestTimecard.leave.slice(8, 10)}時${latestTimecard.leave.slice(10, 12)}分`}</p>
        </div>
      )
    )
  }

  const WorkspotList = () => {
    const Workspot = ({ workspot }: { workspot: TypeUserRelation }) => {
      return (
        <a href={`https://www.google.com/maps/search/?api=1&query=${workspot.latitude},${workspot.longitude}`}>{workspot.workspot}</a>
      )
    }
    return (
      !userRelationList ? <CircularProgress />
        : userRelationListIsError ? <div>error</div>
          : <div>
            {
              userRelationList.params.map((item, index) => {
                return (<Workspot workspot={item} key={index}></Workspot>)
              })
            }
          </div>
    )
  }

  return (
    <>
      <MainContents></MainContents>
      <WorkspotList></WorkspotList>
    </>
  )
}

export default CommonPage;
