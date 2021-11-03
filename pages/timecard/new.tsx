import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import {
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import useAxios from "../../hooks/useAxios";
import useCurrentUser from "../../hooks/useCurrentUser";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../../components/atoms";
import Stack from "@mui/material/Stack";
import DateAdapter from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import Select from "react-select";
import useUserList from "../../hooks/useUserList";
import useWorkspotList from "../../hooks/useWorkspotList";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/ja"
dayjs.locale("ja");
dayjs.extend(isSameOrBefore);

type TypeSelectedOption = {
  value: string;
  label: string;
} | null;

const TimecardNewPage = () => {
  const axios = useAxios();
  const router = useRouter();
  const accessToken = useRecoilValue(accessTokenState);
  const { currentUser, currentUserIsLoading, currentUserIsError } =
    useCurrentUser(accessToken);
  if (
    (!currentUserIsLoading && !currentUser) ||
    (currentUser && currentUser.role !== "admin")
  )
    router.push("/");

  const { state: userState } = useUserList();
  const selectBoxUsers =
    !userState.isLoading &&
    !userState.isError &&
    userState.data.map((item) => {
      return {
        label: item,
        value: item,
      };
    });

  const { state: workspotState } = useWorkspotList();
  const selectBoxWorkspots =
    !workspotState.isLoading &&
    !workspotState.isError &&
    workspotState.data.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
  const [attendance, setAttendance] = useState<dayjs.Dayjs | null>(dayjs());
  const [leave, setLeave] = useState<dayjs.Dayjs | null>(null);
  const [selectedUser, setSelectedUser] = useState<TypeSelectedOption>(null);
  const [selectedWorkspot, setSelectedWorkspot] =
    useState<TypeSelectedOption>(null);

  const handleAttendanceChange = (newValue: dayjs.Dayjs | null) => {
    setAttendance(newValue);
    if (!leave) return
    if(leave.isSameOrBefore(newValue)) setLeave(null)
  };

  const handleLeaveChange = (newValue: dayjs.Dayjs | null) => {
    setLeave(newValue);
  };

  const onClickHandler = async () => {
    if (!attendance || !leave || !selectedUser || !selectedWorkspot ) return;
    console.log(attendance.format("YYYYMMDDHHmmss"));
    const params = {
      user: selectedUser.value,
      workspot: selectedWorkspot.value,
      attendance: attendance.format("YYYYMMDDHHmmss"),
      leave: leave.format("YYYYMMDDHHmmss"),
    };
    try {
      await axios.post("timecard/admin/new", params);
      alert("Insert Success");
    } catch (err) {
      console.log(err);
    }
  };

  const SelectBoxUsers = () => {
    return (
      <>
        {userState.isLoading ? (
          <div>loading</div>
        ) : userState.isError ? (
          <div>error</div>
        ) : (
          <Select
            defaultValue={selectedUser}
            value={selectedUser}
            onChange={setSelectedUser}
            options={selectBoxUsers || []}
            isClearable={true}
          />
        )}
      </>
    );
  };

  const SelelectBoxWorkspot = () => {
    return (
      <>
        {workspotState.isLoading ? (
          <div>loading</div>
        ) : workspotState.isError ? (
          <div>error</div>
        ) : (
          <Select
            defaultValue={selectedWorkspot}
            value={selectedWorkspot}
            onChange={setSelectedWorkspot}
            options={selectBoxWorkspots || []}
            isClearable={true}
          />
        )}
      </>
    );
  };

  return (
    <Layout title="ミズホエンジニアリング | 勤務登録">
      {currentUserIsLoading ? (
        <div>loading</div>
      ) : currentUserIsError ? (
        <div>error</div>
      ) : currentUser.role !== "admin" ? (
        <div>You don't have permission</div>
      ) : (
        <>
          <h1>勤務登録</h1>
          <div>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <Stack spacing={3}>
                <DateTimePicker
                  label="出勤時刻"
                  value={attendance}
                  onChange={handleAttendanceChange}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
              <Stack spacing={3}>
                <DateTimePicker
                  label="退勤時刻"
                  value={leave}
                  onChange={handleLeaveChange}
                  renderInput={(params) => <TextField {...params} />}
                  minDateTime={attendance ?? undefined}
                />
              </Stack>
            </LocalizationProvider>
            <SelectBoxUsers></SelectBoxUsers>
            <SelelectBoxWorkspot></SelelectBoxWorkspot>
            <Button
              variant="outlined"
              disabled={
                !attendance || !leave || !selectedUser || !selectedWorkspot
              }
              onClick={async () => onClickHandler()}
            >
              登録
            </Button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default TimecardNewPage;
