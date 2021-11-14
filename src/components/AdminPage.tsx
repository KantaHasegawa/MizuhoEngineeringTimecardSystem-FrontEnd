import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  CircularProgress,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Badge,
  Card,
  Box,
} from '@mui/material';
import useGetAllLatestTimecard, { TypeTimecard } from '../hooks/useGetAllLatestTimecard';
import ErrorComponent from './ErrorComponent';

const AdminPage = () => {
  const { latestTimecards, latestTimecardsIsError } = useGetAllLatestTimecard();

  const NotAttend = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <Card sx={{ padding: '1rem' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{timecard.user}</Typography>
      </Card>
    );
  };

  const NotLeave = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <Card sx={{ padding: '1rem' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{timecard.user}</Typography>
        <Typography sx={{ fontSize: '1rem', marginLeft: '0.2rem' }}>{timecard.workspot}</Typography>
        <Typography
          sx={{ fontSize: '1rem', marginLeft: '0.2rem' }}
        >{`出勤時刻: ${timecard.attendance.slice(4, 6)}月${timecard.attendance.slice(
          6,
          8,
        )}日${timecard.attendance.slice(8, 10)}時${timecard.attendance.slice(
          10,
          12,
        )}分`}</Typography>
      </Card>
    );
  };

  const AlreadyLeave = ({ timecard }: { timecard: TypeTimecard }) => {
    return (
      <Card sx={{ padding: '1rem' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{timecard.user}</Typography>
        <Typography sx={{ fontSize: '1rem', marginLeft: '0.2rem' }}>{timecard.workspot}</Typography>
        <Typography
          sx={{ fontSize: '1rem', marginLeft: '0.2rem' }}
        >{`出勤時刻: ${timecard.attendance.slice(4, 6)}月${timecard.attendance.slice(
          6,
          8,
        )}日${timecard.attendance.slice(8, 10)}時${timecard.attendance.slice(
          10,
          12,
        )}分`}</Typography>
        <Typography
          sx={{ fontSize: '1rem', marginLeft: '0.2rem' }}
        >{`退勤時刻: ${timecard.leave!.slice(4, 6)}月${timecard.leave!.slice(
          6,
          8,
        )}日${timecard.leave!.slice(8, 10)}時${timecard.leave!.slice(10, 12)}分`}</Typography>
      </Card>
    );
  };

  return !latestTimecards ? (
    <CircularProgress />
  ) : latestTimecardsIsError ? (
    <ErrorComponent></ErrorComponent>
  ) : (
    <>
      <Box sx={{ marginBottom: '2rem' }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={latestTimecards.notLeaveTimecards.length} color='error'>
              <Typography
                sx={{ backgroundColor: '#29B6F6', padding: '0.2rem 0.3rem', borderRadius: '9px' }}
                color='white'
              >
                {' '}
                出勤中{' '}
              </Typography>
            </Badge>
          </AccordionSummary>
          {latestTimecards.notLeaveTimecards.map((item, index) => {
            return (
              <AccordionDetails key={index}>
                <NotLeave timecard={item} key={index}></NotLeave>
              </AccordionDetails>
            );
          })}
        </Accordion>
      </Box>
      <Box sx={{ marginBottom: '2rem' }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={latestTimecards.alreadyLeaveTimecards.length} color='error'>
              <Typography
                sx={{ backgroundColor: '#FFA726', padding: '0.2rem 0.3rem', borderRadius: '9px' }}
                color='white'
              >
                退勤済み
              </Typography>
            </Badge>
          </AccordionSummary>
          {latestTimecards.alreadyLeaveTimecards.map((item, index) => {
            return (
              <AccordionDetails key={index}>
                <AlreadyLeave timecard={item} key={index}></AlreadyLeave>
              </AccordionDetails>
            );
          })}
        </Accordion>
      </Box>
      <Box sx={{ marginBottom: '2rem' }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Badge badgeContent={latestTimecards.notAttendTimecards.length} color='error'>
              <Typography
                sx={{ backgroundColor: '#66BB6A', padding: '0.2rem 0.3rem', borderRadius: '9px' }}
                color='white'
              >
                未出勤
              </Typography>
            </Badge>
          </AccordionSummary>
          {latestTimecards.notAttendTimecards.map((item, index) => {
            return (
              <AccordionDetails key={index}>
                <NotAttend timecard={item} key={index}></NotAttend>
              </AccordionDetails>
            );
          })}
        </Accordion>
      </Box>
    </>
  );
};

export default AdminPage;
