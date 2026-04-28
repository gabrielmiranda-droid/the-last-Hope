import { useEffect, useState } from "react";

function checkPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

export function useIsPortrait(): boolean {
  const [isPortrait, setIsPortrait] = useState(checkPortrait);

  useEffect(() => {
    const handler = () => setIsPortrait(checkPortrait());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);

  return isPortrait;
}
