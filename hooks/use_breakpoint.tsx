import { useEffect, useState } from "react";

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<
    null | "mobile" | "laptop" | "desktop"
  >(null);
  const mobileBreakpoint = 768;
  const laptopBreakpoint = 1024;
  const desktopBreakpoint = 1440;

  const setWidthHandler = () => {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= mobileBreakpoint) {
        setBreakpoint("mobile");
      } else if (
        window.innerWidth > mobileBreakpoint &&
        window.innerWidth <= laptopBreakpoint
      ) {
        setBreakpoint("laptop");
      } else {
        setBreakpoint("desktop");
      }
    });
  };
  useEffect(() => {
    window.addEventListener("resize", setWidthHandler);
    return () => {
      window.removeEventListener("resize", setWidthHandler);
    };
  }, []);

  return breakpoint;
};

export default useBreakpoint;
