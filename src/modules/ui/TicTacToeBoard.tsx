import React from "react";

export type TicTacToePlayer = "X" | "O";
export type TicTacToeState = TicTacToePlayer | " ";
export type TicTacToeBoardState = [
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
  TicTacToeState,
];

const TicTacToeSquare = ({
  state,
  position,
  onClick,
}: {
  state: TicTacToeState;
  position: number;
  onClick?: (event: React.PointerEvent) => void;
}) => {
  const color = (() => {
    switch (state) {
      case "X":
        return "text-red-500";
      case "O":
        return "text-blue-500";
      default:
        return "";
    }
  })();

  const corner = (() => {
    switch (position) {
      case 0:
        return "rounded-tl-lg";
      case 3:
        return "rounded-tr-lg";
      case 12:
        return "rounded-bl-lg";
      case 15:
        return "rounded-br-lg";
      default:
        return "";
    }
  })();

  const className = `size-16 flex items-center justify-center bg-gray-900 ${color} ${corner} leading-none font-neusharp`;
  return (
    <div className={className} onPointerUp={onClick}>
      {state}
    </div>
  );
};

export const TicTacToeBoard = ({
  board,
  turn,
  onClick,
}: {
  board: TicTacToeBoardState;
  turn: TicTacToePlayer;
  onClick?: (square: number, event: React.PointerEvent) => void;
}) => {
  const color = (() => {
    switch (turn) {
      case "X":
        return "outline-red-500";
      case "O":
        return "outline-blue-500";
      default:
        return "outline-gray-400";
    }
  })();

  const className = `inline-grid grid-cols-4 gap-0.5 text-5xl w-max select-none m-1 outline outline-4 rounded-xl ${color} bg-white`;
  return (
    <div className={className}>
      {board.map((state, index) => (
        <TicTacToeSquare
          position={index}
          key={index}
          state={state}
          onClick={(event) => onClick(index, event)}
        />
      ))}
    </div>
  );
};

export default TicTacToeBoard;
