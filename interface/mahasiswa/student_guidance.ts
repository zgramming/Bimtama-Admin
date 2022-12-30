import { MasterData, Users } from "../main_interface";

export interface StudentGuidanceInterface {
  id: number;
  user_id: number;
  group_id: number;
  current_progres_mst_outline_component_id: number;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  group: Group;
  mst_outline_component: MasterData;
  user: Users;
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
