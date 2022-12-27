import { Users } from "../main_interface";

export interface GroupInterface {
  id: number;
  name: string;
  code: string;
  description: null;
  image: null;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  group_member?: GroupMemberInterface[];
}

export interface GroupMemberInterface {
  id: string;
  group_id: number;
  user_id: number;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  group?: GroupInterface;
  user?: Users;
}
