import { OutlineInterface } from "../admin/outline_interface";
import { Users } from "../main_interface";

export interface StudentOutlineInterface {
  id: number;
  user_id: number;
  outline_id: number;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  outline?: OutlineInterface;
  user?: Users;
}
