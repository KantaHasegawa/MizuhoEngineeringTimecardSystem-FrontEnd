import { CircularProgress } from '@material-ui/core'
import useGetAllLatestTimecard, { TypeTimecard } from '../hooks/useGetAllLatestTimecard'

const AdminPage = () => {
  const { latestTimecards, latestTimecardsIsError } = useGetAllLatestTimecard()

  const NotAttend = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <div>
        {timecard.user}
      </div>
    )
  }

  const NotLeave = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <div>
        {timecard.user}
      </div>
    )
  }

  const AlreadyLeave = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <div>
        {timecard.user}
      </div>
    )
  }

  return (
    !latestTimecards ? <CircularProgress /> :
      latestTimecardsIsError ? <div>isError</div> : (
        <>
          <div>
            <h2>未出勤</h2>
            {latestTimecards?.notAttendTimecards.map((item, index) => {
              return (
                <NotAttend timecard={item} key={index}></NotAttend>
              )
            })}
          </div>
          <div>
            <h2>出勤中</h2>
            {latestTimecards?.notLeaveTimecards.map((item, index) => {
              return (
                <NotLeave timecard={item} key={index}></NotLeave>
              )
            })}
          </div>
          <div>
            <h2>退勤済み</h2>
            {latestTimecards?.alreadyLeaveTimecards.map((item, index) => {
              return (
                <AlreadyLeave timecard={item} key={index}></AlreadyLeave>
              )
            })}
          </div>
        </>
      )
  )
}


export default AdminPage;
