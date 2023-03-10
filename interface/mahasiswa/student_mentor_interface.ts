import { Users } from "../main_interface";

export interface StudentMentorInterface {
  id: number;
  name: string;
  code: string;
  description: string;
  image: null;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: null;
  group_member: GroupMember[];
}

interface GroupMember {
  id: string;
  group_id: number;
  user_id: number;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: null;
  updated_by: null;
  user: Users;
}
