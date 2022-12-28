export interface StudentMeetingScheduleInterface {
  id: number;
  group_id: number;
  title: string;
  description: string;
  type: string;
  method: string;
  link_maps: string;
  link_meeting: null;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  group: Group;
  meeting_schedule_present: MeetingSchedulePresent[];
}

interface Group {
  id: number;
  name: string;
  code: string;
  description: string;
  image: null;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: null;
}

interface MeetingSchedulePresent {
  id: string;
  meeting_schedule_id: number;
  user_id: number;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
}
