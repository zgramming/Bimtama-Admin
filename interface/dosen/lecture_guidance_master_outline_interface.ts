export interface LectureGuidanceMasterOutlineInterface {
  id: number;
  name: string;
  code: string;
  guidance_detail: GuidanceDetail[];
}

interface GuidanceDetail {
  id: string;
  guidance_id: number;
  user_id: number;
  group_id: number;
  title: string;
  user: User;
}

interface User {
  name: string;
}
