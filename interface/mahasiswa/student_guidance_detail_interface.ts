export interface StudentGuidanceDetailInterface {
  id: string;
  guidance_id: number;
  user_id: number;
  group_id: number;
  mst_outline_component_id: number;
  title: string;
  description?: string;
  lecture_note?: string;
  status: "progress" | "rejected" | "approved";
  file?: string;
  file_lecture?: string;

  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
}
