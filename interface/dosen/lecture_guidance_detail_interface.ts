import { Users } from "../main_interface";

export interface LectureGuidanceDetailInterface {
  id: string;
  guidance_id: number;
  user_id: number;
  group_id: number;
  mst_outline_component_id: number;
  title: string;
  description: string;
  lecture_note: null;
  status: string;
  file?: string;
  file_lecture?: string;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  user: Users;
}
