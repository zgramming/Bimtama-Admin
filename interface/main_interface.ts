export interface AppGroupUser {
  id: number;
  code: string;
  name: string;
  status: string;
  user: Users[];
  access_modul: AppAccessModul[];
  access_menu: AppAccessMenu[];

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}

export interface AppAccessMenu {
  id: number;
  app_group_user_id: number;
  app_modul_id: number;
  app_menu_id: number;
  allowed_access?: {};

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  app_group_user: AppGroupUser;
  app_modul: AppModul;
  app_menu: AppMenu;
}

export interface AppMenu {
  id: number;
  app_modul_id: number;
  app_menu_id_parent?: number;
  code: string;
  name: string;
  route: string;
  order: number;
  icon: string;
  status: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  app_modul: AppModul;
  menu_parent?: AppMenu;
  menu_childrens: AppMenu[];
  access_menu: AppAccessMenu[];
}

export interface AppAccessModul {
  id: number;
  app_group_user_id: number;
  app_modul_id: number;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  app_group_user?: AppGroupUser;
  app_modul?: AppModul;
}

export interface AppModul {
  id: number;
  code: string;
  name: string;
  order: number;
  pattern: string;
  icon?: string;
  status: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  menus: AppMenu[];
  access_modul: AppAccessModul[];
  access_menu: AppAccessMenu[];
}

export interface Documentation {
  id: number;
  name: string;
  code: string;
  job_id: number;
  birth_date: Date;
  money: number;
  hobbies?: string;
  status?: string;
  description?: string;
  file?: string;
  image?: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
  job: MasterData;
}

export interface MasterCategory {
  id: number;
  master_category_id: string;
  code: string;
  name: string;
  description: string;
  status: string;

  ///
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  master_category_parent?: MasterCategory;
  master_category_children: MasterCategory[];
  master_datas: MasterData[];
}

export interface MasterData {
  id: number;
  master_data_id: number;
  master_category_id: number;
  master_category_code: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  parameter1_key?: string;
  parameter1_value?: string;
  parameter2_key?: string;
  parameter2_value?: string;
  parameter3_key?: string;
  parameter3_value?: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  master_category?: MasterCategory;
  master_data_parent?: MasterData;
  master_data_children: MasterData[];
}

export interface Parameter {
  id: number;
  name: string;
  code: string;
  value: string;
  status: string;

  ///
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}

export interface Users {
  id: number;
  app_group_user_id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  status: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;

  app_group_user?: AppGroupUser;
}
