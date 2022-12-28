import { MasterData, Users } from "../main_interface";

export interface StudentGuidanceOutlineInterface {
  id: number;
  user_id: number;
  outline_id: number;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  user?: Users;
  outline?: Outline;
}

interface Outline {
  id: number;
  mst_outline_id: number;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  master_outline?: MasterData;
  outline_component?: OutlineComponent[];
}

interface OutlineComponent {
  id: string;
  outline_id: number;
  mst_outline_component_id: number;
  title: string;
  description: null;
  order: number;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  master_outline_component?: MasterData;
}
