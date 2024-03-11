import { useImmerReducer } from "use-immer";
import Tree from "../core/Tree.ts";
import { Bounds } from "../core/foundation.tsx";
import { TicTacToeBoard, TicTacToeBoardState } from "./TicTacToeBoard.tsx";
import { MutableRefObject, SVGProps, useRef } from "react";
import {
  TICTACTOE_WIDTH,
  TICTACTOE_HEIGHT,
  TICTACTOE_X_CENTER,
  TICTACTOE_NEXT_X_CENTER,
  TICTACTOE_Y_CENTER,
  TICTACTOE_X_SPACING,
  TICTACTOE_Y_SPACING,
  TICTACTOE_LINE_WIDTH,
} from "../core/constants.ts";
import { Draft } from "immer";

const straightPath = (center: number) => {
  return `M ${TICTACTOE_NEXT_X_CENTER}, ${center} L ${TICTACTOE_X_CENTER}, ${center}`;
};

const generatePaths = (
  parentCenter: number,
  childCenters: number[],
  props?: SVGProps<SVGPathElement>
) => {
  if (childCenters.length === 0) {
    return null;
  } else if (childCenters.length === 1) {
    return <path d={straightPath(childCenters[0])} {...props} />;
  }

  const instructions: string[] = [];
  const centerTop = childCenters.shift();
  const centerBottom = childCenters.pop();

  if (childCenters.length === 0) {
    instructions.push(
      straightPath((centerBottom + centerTop) / 2),
      `M ${TICTACTOE_NEXT_X_CENTER}, ${centerTop} L ${TICTACTOE_NEXT_X_CENTER}, ${centerBottom}`
    );
    return <path d={instructions.join(" ")} {...props} />;
  }

  // curved top  element
  if (centerTop < parentCenter) {
    const c = Math.min(
      parentCenter - TICTACTOE_Y_CENTER,
      centerTop + TICTACTOE_X_SPACING - TICTACTOE_X_CENTER
    );
    const inst = `M ${TICTACTOE_X_SPACING}, ${centerTop} Q ${TICTACTOE_X_CENTER}, ${centerTop} ${TICTACTOE_X_CENTER}, ${c}`;
    instructions.push(inst);
  } else {
    instructions.push(straightPath(centerTop));
  }
  instructions.push(`L ${TICTACTOE_X_CENTER}, ${parentCenter}`);

  // curved bottom  element
  if (centerBottom > parentCenter) {
    const c = Math.max(
      parentCenter + TICTACTOE_Y_CENTER,
      centerBottom - (TICTACTOE_X_SPACING - TICTACTOE_X_CENTER)
    );
    const inst = `M ${TICTACTOE_X_SPACING}, ${centerBottom} Q ${TICTACTOE_X_CENTER}, ${centerBottom} ${TICTACTOE_X_CENTER}, ${c}`;
    instructions.push(inst);
  } else {
    instructions.push(straightPath(centerTop));
  }
  instructions.push(`L ${TICTACTOE_X_CENTER}, ${parentCenter}`);

  for (const center of childCenters) {
    const inst = straightPath(center);
    instructions.push(inst);
  }

  return <path d={instructions.join(" ")} {...props} />;
};

const renderBoards = (
  boards: Tree<TicTacToeBoardState>,
  clickHandler: (
    board: Tree<TicTacToeBoardState>,
    square: number,
    event: React.PointerEvent
  ) => void,
  top = 0
): [JSX.Element, number] => {
  const depth = boards.depth;
  const left = depth * TICTACTOE_X_SPACING;
  const finalBoardJSX = [];
  let lines: JSX.Element;
  let childTop = top;
  let myTop = top;
  if (boards.branches.length > 0) {
    const childCenters: number[] = [];
    childTop -= TICTACTOE_Y_SPACING;
    for (const i in boards.branches) {
      const board = boards.branches[i];
      childTop += TICTACTOE_Y_SPACING;

      const [childJSX, newTop] = renderBoards(board, clickHandler, childTop);
      childCenters.push(
        childTop - top + (newTop - childTop) / 2 + TICTACTOE_Y_CENTER
      );
      finalBoardJSX.push(childJSX);
      childTop = newTop;
    }

    const childHeight = childTop - top;
    myTop = top + childHeight / 2;

    const svgHeight = childHeight + TICTACTOE_HEIGHT;
    const path = generatePaths(myTop - top + TICTACTOE_Y_CENTER, childCenters, {
      fill: "transparent",
      stroke: "white",
      strokeWidth: TICTACTOE_LINE_WIDTH,
    });
    lines = (
      <Bounds
        top={top}
        left={left}
        width={TICTACTOE_NEXT_X_CENTER + TICTACTOE_LINE_WIDTH}
        height={svgHeight}
      >
        <svg
          width={TICTACTOE_NEXT_X_CENTER + TICTACTOE_LINE_WIDTH}
          height={svgHeight}
        >
          {path}
        </svg>
      </Bounds>
    );
  }

  const key = `${depth}_${top}`;
  const self = (
    <Bounds
      key={key}
      top={myTop}
      left={left}
      width={TICTACTOE_WIDTH}
      height={TICTACTOE_HEIGHT}
    >
      <TicTacToeBoard
        board={boards.value}
        turn={depth % 2 === 0 ? "X" : "O"}
        onClick={(square, event) => clickHandler(boards, square, event)}
      />
    </Bounds>
  );

  return [
    <>
      {lines}
      {self}
      {...finalBoardJSX}
    </>,
    childTop,
  ];
};

const newBoard = (): TicTacToeBoardState => {
  return [
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
};

interface BranchAction {
  type: "branch";
  path: number[];
  square: number;
}

interface SetAction {
  type: "set";
  path: number[];
  square: number;
}

interface ResetAction {
  type: "reset";
}

type BoardAction = BranchAction | ResetAction | SetAction;

const boardsReducer = (
  boards: Draft<Tree<TicTacToeBoardState>>,
  action: BoardAction
) => {
  switch (action.type) {
    case "set": {
      const board = action.path.reduce(
        (tree, index) => tree.branches[index],
        boards
      );
      board.value[action.square] = "X";
      break;
    }
    case "branch": {
      const board = action.path.reduce(
        (tree, index) => tree.branches[index],
        boards
      );
      const newBoard = board.growBranch([...board.value]);
      newBoard.value[action.square] = "X";
      break;
    }
    case "reset": {
      boards = Object.assign(boards, newBoard());
      break;
    }
  }
};

const getRefMap = <K, V>(ref: MutableRefObject<Map<K, V>>): Map<K, V> => {
  if (!ref.current) {
    // Initialize the Map on first usage.
    ref.current = new Map();
  }
  return ref.current;
};

const BoardTree = ({
  boards,
  path,
  dispatch,
}: {
  boards: Tree<TicTacToeBoardState>;
  path: number[];
  dispatch: (action: BoardAction) => void;
}) => {
  const childRefs = useRef<Map<TicTacToeBoardState, HTMLDivElement>>(null);
  const childJSX = boards.branches.map((childBoards, index) => (
    <div
      className="col-start-2"
      key={index}
      ref={(node) => {
        const map = getRefMap<TicTacToeBoardState, HTMLDivElement>(childRefs);
        if (node) {
          map.set(childBoards.value, node);
        } else {
          map.delete(childBoards.value);
        }
      }}
    >
      <BoardTree
        boards={childBoards}
        path={path.concat(index)}
        dispatch={dispatch}
      />
    </div>
  ));
  const childCenters: number[] = [];
  childRefs.current?.forEach((value) => {
    childCenters.push(
      value.getBoundingClientRect().height + childCenters[-1] ??
        TICTACTOE_X_CENTER
    );
  });
  const lines =
    childCenters.length === 0 ? null : (
      <svg
        className="absolute -z-10"
        width={TICTACTOE_X_SPACING}
        height={childCenters[-1] + TICTACTOE_Y_SPACING}
      >
        {generatePaths(0, childCenters, {
          fill: "transparent",
          stroke: "white",
          strokeWidth: TICTACTOE_LINE_WIDTH,
        })}
      </svg>
    );
  return (
    <div className={`grid grid-cols-none grid-flow-col w-max`}>
      <div
        className="inline-block col-start-1"
        style={{ width: TICTACTOE_X_SPACING, height: TICTACTOE_Y_SPACING }}
      >
        {lines}
        <TicTacToeBoard
          board={boards.value}
          turn={boards.depth % 2 == 0 ? "X" : "O"}
          onClick={(square) =>
            dispatch({
              type: "branch",
              path: path,
              square: square,
            })
          }
        />
      </div>
      {childJSX}
    </div>
  );
};

export const TicTacToeGame = () => {
  const [boards, dispatch] = useImmerReducer<
    Tree<TicTacToeBoardState>,
    BoardAction,
    null
  >(boardsReducer, null, () => Tree.from(newBoard()));

  return (
    <BoardTree
      boards={boards}
      path={[]}
      dispatch={(action) => dispatch(action)}
    ></BoardTree>
  );
};

export default TicTacToeGame;
