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
      label: "\u25c0",
      style: { width: 72, height: 72 },
      onDown: () => eng()?.injectInput({ left: true }),
      onUp: () => eng()?.injectInput({ left: false })
    },
    {
      id: "right",
      label: "\u25b6",
      style: { width: 72, height: 72 },
      onDown: () => eng()?.injectInput({ right: true }),
      onUp: () => eng()?.injectInput({ right: false })
    },
    {
      id: "jump",
      label: "\u25b2",
      extraClass: "touch-btn-jump",
      style: { width: 84, height: 84 },
      onDown: () => eng()?.injectInput({ jumpPressed: true, jumpHeld: true }),
      onUp: () => eng()?.injectInput({ jumpHeld: false })
    },
    {
      id: "dash",
      label: "\u26a1",
      style: { width: 64, height: 64 },
      onDown: () => eng()?.injectInput({ dashPressed: true })
    },
    {
      id: "interact",
      label: "E",
      style: { width: 64, height: 64 },
      onDown: () => eng()?.injectInput({ interactPressed: true })
    },
    {
      id: "pause",
      label: "\u23f8",
      style: { width: 44, height: 44, fontSize: "0.9rem" },
      onDown: () => eng()?.injectInput({ pausePressed: true })
    }
  ];

  return (
    <div className="touch-controls" aria-hidden="true">
      {buttons.map(({ id, label, extraClass, style, onDown, onUp }) => (
        <button
          key={id}
          className={`touch-btn touch-btn-${id}${extraClass ? ` ${extraClass}` : ""}`}
          style={style}
          tabIndex={-1}
          onPointerDown={(event) => {
            event.preventDefault();
            onDown();
          }}
          onPointerUp={(event) => {
            event.preventDefault();
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
