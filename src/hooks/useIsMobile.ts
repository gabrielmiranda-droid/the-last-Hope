import { useEffect, useState } from "react";

function detectTouch(): boolean {
  return navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(detectTouch);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = () => setIsMobile(detectTouch());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
