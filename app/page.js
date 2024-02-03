"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import mine from "../public/mine.png";
import GameBoard from "./GameBoard";

const gameConfigWeb = [
  {
    label: "Beginner",
    ROWS: 9,
    COLS: 9,
    MINE_COUNT: 10,
  },
  {
    label: "Intermediate",
    ROWS: 16,
    COLS: 16,
    MINE_COUNT: 40,
  },
  {
    label: "Expert",
    ROWS: 16,
    COLS: 30,
    MINE_COUNT: 99,
  },
];

const gameConfigMob = [
  {
    label: "Beginner",
    ROWS: 9,
    COLS: 9,
    MINE_COUNT: 10,
  },
  {
    label: "Intermediate",
    ROWS: 16,
    COLS: 16,
    MINE_COUNT: 40,
  },
  {
    label: "Expert",
    ROWS: 30,
    COLS: 16,
    MINE_COUNT: 99,
  },
];

export default function Home() {
  const [game, setGame] = useState(null);

  return (
    <main className="flex min-h-screen relative flex-col items-center justify-center overflow-hidden">
      <div className="text-gray-600 md:text-[24px] text-[20px] font-medium mb-4">
        {game?.label || "Mine Sweeper"}
      </div>

      {game ? (
        <GameBoard {...game} setGame={setGame} />
      ) : (
        <>
          <div className="md:flex hidden flex-col gap-y-5 md:max-w-[400px] w-full md:px-0 px-6">
            {gameConfigWeb?.map((config) => (
              <div
                onClick={() => setGame(config)}
                key={config?.label}
                className="rounded-md flex items-center cursor-pointer duration-300 hover:bg-gray-200 border w-full border-gray-300 text-gray-600 px-4 py-2"
              >
                <div className="flex-1">{config?.label}</div>
                {config?.ROWS} x {config?.COLS}
                <div className="flex items-center">
                  <Image
                    src={mine}
                    height={24}
                    width={24}
                    alt="mine"
                    className="mr-1 ml-4 shrink-0"
                  />{" "}
                  {config?.MINE_COUNT}
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden flex flex-col gap-y-5 md:max-w-[400px] w-full md:px-0 px-6">
            {gameConfigMob?.map((config) => (
              <div
                onClick={() => setGame(config)}
                key={config?.label}
                className="rounded-md flex items-center cursor-pointer duration-300 hover:bg-gray-200 border w-full border-gray-300 text-gray-600 px-4 py-2"
              >
                <div className="flex-1">{config?.label}</div>
                {config?.ROWS} x {config?.COLS}
                <div className="flex items-center">
                  <Image
                    src={mine}
                    height={24}
                    width={24}
                    alt="mine"
                    className="mr-1 ml-4 shrink-0"
                  />{" "}
                  {config?.MINE_COUNT}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
