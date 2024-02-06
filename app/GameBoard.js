"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import mine from "../public/mine.png";
import flag from "../public/flag.png";
import Lottie from "lottie-react";
import ConfettiLottie from "../public/hurray.json";

const TIMEOUT_TIME = 150;

const textClasses = {
  0: "",
  1: "text-[#0000FF]",
  2: "text-[#00A36C]",
  3: "text-[#FF0000]",
  4: "text-[#00008B]",
  5: "text-[#964B00]",
  6: "text-[#008B8B]",
  7: "text-black",
  8: "text-[#808080]",
};

export default function GameBoard({ MINE_COUNT, ROWS, COLS, setGame }) {
  const lottieRef = useRef(null);

  const [board, setBoard] = useState([]);
  const [mines, setMines] = useState([]);
  const [visitedTiles, setVisitedTiles] = useState(0);
  const [flagged, setFlagged] = useState(0);
  const [gameStatus, setGameStatus] = useState("IDLE");
  const [mineTimeouts, setMineTimeouts] = useState([]);

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const stopBlastPipe = () => {
    [...mineTimeouts]?.reverse()?.forEach((id) => {
      clearTimeout(id);
    });
  };

  const putMine = (board, mines, count, banRow, banCol) => {
    if (count === MINE_COUNT) return { board, mines };
    const row = randomIntFromInterval(0, ROWS - 1);
    const col = randomIntFromInterval(0, COLS - 1);

    if ((row === banRow && col === banCol) || board[row][col].mine) {
      return putMine(board, mines, count, banRow, banCol);
    } else {
      board[row][col].mine = true;
      if (row - 1 >= 0 && col - 1 >= 0) {
        board[row - 1][col - 1].count = board[row - 1][col - 1].count + 1;
      }
      if (row - 1 >= 0) {
        board[row - 1][col].count = board[row - 1][col].count + 1;
      }
      if (row - 1 >= 0 && col + 1 <= COLS - 1) {
        board[row - 1][col + 1].count = board[row - 1][col + 1].count + 1;
      }
      if (row + 1 <= ROWS - 1 && col - 1 >= 0) {
        board[row + 1][col - 1].count = board[row + 1][col - 1].count + 1;
      }
      if (row + 1 <= ROWS - 1) {
        board[row + 1][col].count = board[row + 1][col].count + 1;
      }
      if (row + 1 <= ROWS - 1 && col + 1 <= COLS - 1) {
        board[row + 1][col + 1].count = board[row + 1][col + 1].count + 1;
      }
      if (col + 1 <= COLS - 1) {
        board[row][col + 1].count = board[row][col + 1].count + 1;
      }
      if (col - 1 >= 0) {
        board[row][col - 1].count = board[row][col - 1].count + 1;
      }
      count++;
      mines.push({ row, col });
      return putMine(board, mines, count, banRow, banCol);
    }
  };

  const createBoard = () => {
    setGameStatus("IDLE");
    lottieRef?.current?.goToAndStop(0);
    stopBlastPipe();

    let tile = {
      visited: false,
      count: 0,
      mine: false,
      poc: false,
      flagged: false,
    };

    const boardArr = Array(ROWS).fill(Array(COLS).fill({ ...tile }));
    setVisitedTiles(0);
    setFlagged(0);
    setBoard(boardArr);
    setMineTimeouts([]);
  };

  const recursiveVisit = (board, row, col) => {
    if (
      row < 0 ||
      row > ROWS - 1 ||
      col < 0 ||
      col > COLS - 1 ||
      board[row][col].visited
    ) {
      return;
    }

    if (board[row][col].count > 0) {
      board[row][col].visited = true;
      setVisitedTiles((visitedTiles) => visitedTiles + 1);
      return;
    }

    board[row][col].visited = true;
    setVisitedTiles((visitedTiles) => visitedTiles + 1);
    recursiveVisit(board, row - 1, col - 1);
    recursiveVisit(board, row - 1, col);
    recursiveVisit(board, row - 1, col + 1);
    recursiveVisit(board, row + 1, col - 1);
    recursiveVisit(board, row + 1, col);
    recursiveVisit(board, row + 1, col + 1);
    recursiveVisit(board, row, col + 1);
    recursiveVisit(board, row, col - 1);
  };

  const playMineSound = () => {
    const sound = new Audio("/mineBlast.mp3");
    sound.volume = 1;
    sound.play();
  };

  const playGameSound = () => {
    const sound = new Audio("/play.mp3");
    sound.volume = 0.75;
    sound.play();
  };

  const playWinSound = () => {
    const sound = new Audio("/win.mp3");
    sound.volume = 1;
    sound.play();
  };

  const playLoseSound = () => {
    const sound = new Audio("/lose.mp3");
    sound.volume = 1;
    sound.play();
  };

  const blast = (mineCount, mine, remainingMines, TIMEOUT_TIME) => {
    return new Promise((res) => {
      if (board[mine.row][mine.col].visited) {
        if (mineCount) {
          blast(
            mineCount - 1,
            remainingMines[mineCount - 1],
            remainingMines,
            TIMEOUT_TIME - 3
          );
        }

        res();
        return;
      }

      const timerId = setTimeout(async () => {
        setBoard((board) => {
          const boardDup = JSON.parse(JSON.stringify(board));
          boardDup[mine.row][mine.col].visited = true;

          return boardDup;
        });

        playMineSound();

        if (mineCount) {
          blast(
            mineCount - 1,
            remainingMines[mineCount - 1],
            remainingMines,
            TIMEOUT_TIME - 3
          );
        }
        res();
      }, TIMEOUT_TIME);

      setMineTimeouts((ids) => [...ids, timerId]);
    });
  };

  const blastMines = async (remainingMines, TIMEOUT_TIME) => {
    const mineCount = remainingMines?.length;

    await blast(
      mineCount,
      remainingMines[mineCount - 1],
      remainingMines,
      TIMEOUT_TIME
    );
  };

  const handleTileVisit = (row, col) => {
    let boardDu = JSON.parse(JSON.stringify(board));
    let mineArr = [...mines];
    if (gameStatus === "IDLE") {
      const { board: boardArray, mines: mineAr } = putMine(
        JSON.parse(JSON.stringify(boardDu)),
        [],
        0,
        row,
        col
      );
      boardDu = boardArray;
      mineArr = mineAr;

      setMines(mineArr);
      setGameStatus("PLAY");
    }
    const boardDup = boardDu;
    if (boardDup[row][col].visited) return;
    if (boardDup[row][col].mine) {
      boardDup[row][col].visited = true;
      boardDup[row][col].poc = true;

      const mineIndex = mineArr?.findIndex(
        (mine) => mine?.row === row && mine?.col === col
      );
      const remainingMines = [...mineArr];
      remainingMines?.splice(mineIndex, 1);

      playLoseSound();

      setBoard(boardDup);
      setGameStatus("LOSE");
      const bigTimer = setTimeout(
        () => blastMines(remainingMines, TIMEOUT_TIME),
        1250
      );
      setMineTimeouts((id) => [...id, bigTimer]);
      return;
    }

    if (!boardDup[row][col].visited) {
      playGameSound();
      recursiveVisit(boardDup, row, col);
      setBoard(boardDup);
    }
  };

  const markFlag = (row, col) => {
    const boardDup = JSON.parse(JSON.stringify(board));

    if (boardDup[row][col].flagged) {
      boardDup[row][col].flagged = false;
      boardDup[row][col].visited = false;

      setVisitedTiles((visited) => visited - 1);
      setFlagged((flag) => flag - 1);
    } else {
      if (flagged <= MINE_COUNT && !boardDup[row][col].visited) {
        boardDup[row][col].flagged = true;
        boardDup[row][col].visited = true;
        setFlagged((flag) => flag + 1);
        setVisitedTiles((visited) => visited + 1);
      }
    }

    setBoard(boardDup);
  };

  const tileClick = (e, row, col) => {
    if (gameStatus === "WIN" || gameStatus === "LOSE") return;
    if (e?.which === 3 || e?.button === 2) {
      markFlag(row, col);
    } else {
      handleTileVisit(row, col);
    }
  };

  const winGame = () => {
    if (visitedTiles + MINE_COUNT - flagged === ROWS * COLS) {
      setGameStatus("WIN");
      playWinSound();
      lottieRef?.current?.play();

      const dupBoard = JSON.parse(JSON.stringify(board));
      mines?.forEach((mine) => {
        dupBoard[mine?.row][mine?.col].flagged = true;
        dupBoard[mine?.row][mine?.col].visited = true;
      });
      setBoard(dupBoard);
    }
  };

  useEffect(() => {
    createBoard();
  }, []);

  useEffect(winGame, [visitedTiles, flagged]);

  useEffect(() => {
    const removeMenu = (event) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", removeMenu);

    return () => document.removeEventListener("contextmenu", removeMenu);
  }, []);

  return (
    <div className="flex flex-col items-center relative w-full max-w-[800px]">
      <div className="absolute md:mt-[120px] mt-[50px] h-full w-full flex flex-col items-center justify-center">
        <Lottie
          lottieRef={lottieRef}
          autoplay={false}
          animationData={ConfettiLottie}
          loop={false}
        />
      </div>

      <div className="flex gap-x-3 w-full px-3 max-w-[400px]">
        <div
          className="cursor-pointer flex-1 mb-4 text-center py-1 rounded-md border-gray-400 border text-gray-600 hover:bg-gray-300 duration-300 z-10 self-center"
          onClick={() => {
            createBoard();
          }}
        >
          Reload
        </div>

        <div
          className="cursor-pointer flex-1 mb-4 text-center py-1 rounded-md border-gray-400 border text-gray-600 hover:bg-gray-300 duration-300 z-10 self-center"
          onClick={() => {
            setGame(null);
            stopBlastPipe();
          }}
        >
          Level
        </div>
      </div>

      {board?.map((row, rowId) => (
        <div key={rowId} className="flex">
          {row?.map((col, colId) => (
            <div
              onMouseDown={(e) => tileClick(e, rowId, colId)}
              key={colId}
              className={`md:w-8 md:h-8 w-6 h-6 flex justify-center items-center border-black border-opacity-50 duration-200 cursor-pointer font-bold text-lg border-l-[1px] border-t-[1px] relative ${
                textClasses?.[col?.count]
              } ${
                col?.poc
                  ? "bg-[#FF0000] bg-opacity-75"
                  : col?.visited
                  ? "bg-gray-300"
                  : "bg-gray-100 hover:bg-gray-300"
              }  ${colId === COLS - 1 ? "border-r-[1px]" : ""} ${
                rowId === ROWS - 1 ? "border-b-[1px]" : ""
              }`}
            >
              {col?.visited ? (
                col?.flagged ? (
                  <>
                    <div className="md:w-[22px] md:h-[22px] w-[16px] h-[16px]">
                      <Image src={flag} height={22} width={22} alt="pin" />
                    </div>
                    {gameStatus === "LOSE" && !col?.mine ? (
                      <div className="absolute items-center justify-center flex rotate-45">
                        <div className="h-7 w-[3px] rounded-md bg-red-500 absolute" />
                        <div className="w-7 h-[3px] rounded-md bg-red-500 absolute" />
                      </div>
                    ) : null}
                  </>
                ) : col?.mine ? (
                  <div className="md:h-6 md:w-6 h-5 w-5">
                    <Image src={mine} height={24} width={24} alt="mine" />
                  </div>
                ) : (
                  col?.count || ""
                )
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
