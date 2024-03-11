import {
  cameraToScreenCoordinates,
  scaleWithAnchorPoint,
} from "../core/camera-utils.ts";
import { CAMERA_ANGLE } from "../core/constants.ts";

export interface CanvasState {
  shouldRender: boolean;
  pixelRatio: number; // our resolution for dip calculations
  container: {
    //holds information related to our screen container
    width: number;
    height: number;
  };
  pointer: {
    x: number;
    y: number;
  };
  camera: {
    //holds camera state
    x: number;
    y: number;
    z: number;
  };
}
const getInitialCanvasState = (): CanvasState => {
  return {
    shouldRender: true,
    pixelRatio: window.devicePixelRatio || 1,
    container: {
      width: 0,
      height: 0,
    },
    pointer: {
      x: 0,
      y: 0,
    },
    camera: {
      x: 0,
      y: 0,
      z: 0,
    },
  };
};

let canvasData = getInitialCanvasState();

export default class CanvasStore {
  private static get data() {
    if (!canvasData)
      canvasData = {
        shouldRender: true,
        pixelRatio: window.devicePixelRatio || 1,
        container: {
          width: 0,
          height: 0,
        },
        pointer: {
          x: 0,
          y: 0,
        },
        camera: {
          x: 0,
          y: 0,
          z: 0,
        },
      };
    return canvasData;
  }

  static initialize(width: number, height: number) {
    const containerWidth = width;
    const containerHeight = height;
    canvasData = getInitialCanvasState();
    canvasData.pixelRatio = window.devicePixelRatio || 1;
    canvasData.container.width = containerWidth;
    canvasData.container.height = containerHeight;
    canvasData.camera.x = 0.5 * containerWidth;
    canvasData.camera.y = 0.5 * containerHeight;
    canvasData.camera.z = containerWidth / (2 * Math.tan(CAMERA_ANGLE));
  }
  public static get screen() {
    const { x, y, z } = this.camera;
    const aspect = this.aspect;
    const angle = CAMERA_ANGLE;
    return cameraToScreenCoordinates(x, y, z, angle, aspect);
  }
  public static get camera() {
    return this.data.camera;
  }
  public static get scale() {
    const { width: w, height: h } = CanvasStore.screen;
    const { width: cw, height: ch } = CanvasStore.container;
    return { x: cw / w, y: ch / h };
  }
  public static get shouldRender() {
    return canvasData.shouldRender;
  }
  public static set shouldRender(value: boolean) {
    canvasData.shouldRender = value;
  }

  public static get pointer() {
    return canvasData.pointer;
  }

  public static get aspect() {
    return canvasData.container.width / canvasData.container.height;
  }

  private static get container() {
    return canvasData.container;
  }

  private static isCameraInBounds(
    cameraX: number,
    cameraY: number,
    cameraZ: number,
  ) {
    return cameraZ > 0;
  }

  public static scrollCamera(mx: number, my: number) {
    const scrollFactor = 1.5;
    const deltaX = mx * scrollFactor,
      deltaY = my * scrollFactor;
    const { x, y, z } = this.camera;
    if (this.isCameraInBounds(x + deltaX, y + deltaY, z)) {
      this.data.camera.x += deltaX;
      this.data.camera.y += deltaY;
      this.shouldRender = true;
      // move pointer by the same amount
      this.movePointerRaw(deltaY, deltaY);
    }
  }

  public static panCamera(mx: number, my: number) {
    const deltaX = mx,
      deltaY = my;
    const { x, y, z } = this.camera;
    if (this.isCameraInBounds(x - deltaX, y - deltaY, z)) {
      this.data.camera.x -= deltaX;
      this.data.camera.y -= deltaY;
      this.shouldRender = true;
      // move pointer by the same amount
      this.movePointer(mx, my);
    }
  }

  public static zoomCamera(delta: number) {
    // Normal zoom is quite slow, we want to scale the amount quite a bit
    const zoomScaleFactor = 10;
    const deltaAmount = zoomScaleFactor * delta;
    const { x: oldX, y: oldY, z: oldZ } = this.camera;
    const oldScale = { ...this.scale };

    const { width: containerWidth, height: containerHeight } = this.container;
    const { width, height } = cameraToScreenCoordinates(
      oldX,
      oldY,
      oldZ + deltaAmount,
      CAMERA_ANGLE,
      this.aspect,
    );
    const newScaleX = containerWidth / width;
    const newScaleY = containerHeight / height;
    const { x: newX, y: newY } = scaleWithAnchorPoint(
      this.pointer.x,
      this.pointer.y,
      oldX,
      oldY,
      oldScale.x,
      oldScale.y,
      newScaleX,
      newScaleY,
    );
    const newZ = oldZ + deltaAmount;
    this.shouldRender = true;
    if (this.isCameraInBounds(oldX, oldY, newZ)) {
      this.data.camera = {
        x: newX,
        y: newY,
        z: newZ,
      };
    }
  }

  // set the pointer position from top left of the screen
  public static setPointer(posX: number, posY: number) {
    const scale = this.scale;
    const { x: left, y: top } = this.screen;
    this.data.pointer.x = left + posX / scale.x;
    this.data.pointer.y = top + posY / scale.y;
  }

  public static movePointer(mx: number, my: number) {
    const scale = this.scale;
    const deltaX = mx / scale.x;
    const deltaY = my / scale.y;
    this.data.pointer.x += deltaX;
    this.data.pointer.y += deltaY;
  }

  private static movePointerRaw(deltaX: number, deltaY: number) {
    this.data.pointer.x += deltaX;
    this.data.pointer.y += deltaY;
  }
}
