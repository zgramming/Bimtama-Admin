import { Users } from "../main_interface";
import { LectureMeetingScheduleInterface } from "./lecture_meeting_schedule_interface";

export interface LectureMeetingSchedulePersonalInterface {
  id: string;
  meeting_schedule_id: number;
  group_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  user: Users;
  meeting_schedule: LectureMeetingScheduleInterface;
}
