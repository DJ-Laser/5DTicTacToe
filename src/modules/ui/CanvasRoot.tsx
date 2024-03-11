import CanvasStore from "../state/CanvasStore.ts";
import { PointerEvent, useEffect, useRef, WheelEvent } from "react";
import useSize from "@react-hook/size";
import { useRenderLoop, FrameContext } from "../core/RenderLoop.ts";
import { Offset, Scale } from "../core/foundation.tsx";

const wheelListener = (e: WheelEvent) => {
  const friction = 1;
  const event = e as WheelEvent;
  const deltaY = event.deltaY * friction;

  CanvasStore.zoomCamera(deltaY);
};

const pointerListener = (event: PointerEvent) => {
  if (event.buttons === 0) {
    CanvasStore.setPointer(event.clientX, event.clientY);
  } else if (event.buttons === 1) {
    event.preventDefault();
    CanvasStore.panCamera(event.movementX, event.movementY);
  }
};

const CanvasRoot = ({ children }: { children: JSX.Element }) => {
  const canvas = useRef<HTMLDivElement>(null);
  const [width, height] = useSize(canvas);
  useEffect(() => {
    if (width === 0 || height === 0) return;
    CanvasStore.initialize(width, height);
  }, [width, height]);
  const frame = useRenderLoop(60);
  const screen = CanvasStore.screen;
  return (
    <FrameContext.Provider value={frame}>
      <div
        className="w-full h-full relative overflow-hidden overscroll-none bg-gray-950"
        ref={canvas}
        onWheel={wheelListener}
        onPointerMove={pointerListener}
      >
        <Scale>
          <Offset top={-screen.y} left={-screen.x}>
            {children}
          </Offset>
        </Scale>
      </div>
    </FrameContext.Provider>
  );
};

export default CanvasRoot;
