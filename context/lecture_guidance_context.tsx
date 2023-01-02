import { createContext } from "react";

type ContextType = {
  reloadMasterOutlineComponent?: any;
};

export const LectureGuidanceContext = createContext<ContextType>({
  reloadMasterOutlineComponent: undefined,
});

export const LectureGuidanceProvider = LectureGuidanceContext.Provider;
