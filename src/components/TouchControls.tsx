import type { CSSProperties, RefObject } from "react";
import type { GameEngine } from "../game/GameEngine";

interface Props {
  engineRef: RefObject<GameEngine | null>;
}

type TouchButton = {
  id: string;
  label: string;
  extraClass?: string;
  style: CSSProperties;
  onDown: () => void;
  onUp?: () => void;
};

export function TouchControls({ engineRef }: Props) {
  const eng = () => engineRef.current;

  const buttons: TouchButton[] = [
    {
      id: "left",
      label: "◀",
      style: { bottom: 24, left: 20, width: 72, height: 72 },
      onDown: () => eng()?.injectInput({ left: true }),
      onUp: () => eng()?.injectInput({ left: false }),
    },
    {
      id: "right",
      label: "▶",
      style: { bottom: 24, left: 108, width: 72, height: 72 },
      onDown: () => eng()?.injectInput({ right: true }),
      onUp: () => eng()?.injectInput({ right: false }),
    },
    {
      id: "jump",
      label: "↑",
      extraClass: "touch-btn-jump",
      style: { bottom: 24, right: 20, width: 84, height: 84 },
      onDown: () => eng()?.injectInput({ jumpPressed: true, jumpHeld: true }),
      onUp: () => eng()?.injectInput({ jumpHeld: false }),
    },
    {
      id: "dash",
      label: "⚡",
      style: { bottom: 120, right: 24, width: 64, height: 64 },
      onDown: () => eng()?.injectInput({ dashPressed: true }),
    },
    {
      id: "interact",
      label: "E",
      style: { bottom: 24, right: 120, width: 64, height: 64 },
      onDown: () => eng()?.injectInput({ interactPressed: true }),
    },
    {
      id: "pause",
      label: "⏸",
      style: { top: 12, right: 12, width: 44, height: 44, fontSize: "0.9rem" },
      onDown: () => eng()?.injectInput({ pausePressed: true }),
    },
  ];

  return (
    <div className="touch-controls" aria-hidden="true">
      {buttons.map(({ id, label, extraClass, style, onDown, onUp }) => (
        <button
          key={id}
          className={`touch-btn${extraClass ? ` ${extraClass}` : ""}`}
          style={{ position: "absolute", ...style }}
          tabIndex={-1}
          onPointerDown={(ev) => {
            ev.preventDefault();
            onDown();
          }}
          onPointerUp={(ev) => {
            ev.preventDefault();
            onUp?.();
          }}
          onPointerLeave={() => onUp?.()}
          onPointerCancel={() => onUp?.()}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
