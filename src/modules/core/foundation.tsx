import CanvasStore from "../state/CanvasStore.ts";
import { PropsWithChildren, createContext, useContext } from "react";
import { inBounds } from "./math-utils.ts";

export interface CanvasPosition {
  top: number;
  left: number;
}

export interface CanvasBounds extends CanvasPosition {
  width: number;
  height: number;
}

const PositionContext = createContext<CanvasPosition>({ top: 0, left: 0 });

export const Scale = ({ children }: { children: JSX.Element }) => {
  const scale = CanvasStore.scale;
  return (
    <div
      style={{
        transform: `scale(${(scale.x, scale.y)})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  );
};

export const Offset = ({
  left,
  top,
  children,
}: PropsWithChildren<CanvasPosition>) => {
  const { top: oldTop, left: oldLeft } = useContext(PositionContext);
  const newLeft = oldLeft + left;
  const newTop = oldTop + top;
  return (
    <PositionContext.Provider value={{ top: newTop, left: newLeft }}>
      <div
        className="absolute inline-block"
        style={{
          left: `${left}px`,
          top: `${top}px`,
        }}
      >
        {children}
      </div>
    </PositionContext.Provider>
  );
};

export const Bounds = ({
  left,
  top,
  width,
  height,
  children,
}: PropsWithChildren<CanvasBounds>) => {
  const { top: oldTop, left: oldLeft } = useContext(PositionContext);
  const screen = CanvasStore.screen;
  const scale = CanvasStore.scale;
  if (
    inBounds(
      { left: oldLeft + left, top: oldTop + top, height, width },
      {
        left: 0,
        top: 0,
        width: screen.width * Math.max(scale.x, 1),
        height: screen.height * Math.max(scale.y, 1),
      },
    )
  ) {
    return (
      <Offset top={top} left={left}>
        {children}
      </Offset>
    );
  } else return null;
};
