import axios from "axios";
import useSWR from "swr";

import StudentMeetingScheduleComponent from "../../../../components/student/student_meeting_schedule_component";
import useUserLogin from "../../../../hooks/use_userlogin";
import { StudentMeetingScheduleInterface } from "../../../../interface/mahasiswa/student_meeting_schedule_interface";
import { baseAPIURL } from "../../../../utils/constant";

const meetingScheduleFetcher = async ([url]: any) => {
  const request = await axios.get(`${url}`);
  const {
    data,
    success,
  }: { data: StudentMeetingScheduleInterface[]; success: boolean } =
    request.data;
  return data;
};

const Page = () => {
  const user = useUserLogin();

  const codePersonal = "personal";
  const { data: dataMeetingSchedule, isLoading: isLoadingMeetingSchedule } =
    useSWR(
      [
        `${baseAPIURL}/mahasiswa/meeting-schedule/${user?.id}/type/${codePersonal}`,
      ],
      meetingScheduleFetcher
    );

  return (
    <>
      <StudentMeetingScheduleComponent items={dataMeetingSchedule ?? []} />
    </>
  );
};

export default Page;
