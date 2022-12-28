import { MasterData } from "../main_interface";

export interface OutlineInterface {
  id: number;
  mst_outline_id: number;
  title: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  master_outline?: MasterData;
  outline_component: OutlineComponentInterface[];
}

export interface OutlineComponentInterface {
  id: string;
  outline_id: number;
  mst_outline_component_id: number;
  title: string;
  order: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
  outline?: OutlineInterface;
  master_outline_component?: MasterData;
}
