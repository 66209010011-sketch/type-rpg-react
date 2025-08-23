import React from "react";
import Healthbar from "./Healthbar";
import { splitByLanguage } from "../utils/thaiSplit"; // <- path อาจต่างตามโครงสร้างโปรเจ็กต์

export default function GameInfoBar({ message, word, typedIndexes, health, playerName, language, startTime, typedCount, correctCount }) {
  const chars = splitByLanguage(word, language, "char");
  const elapsedMinutes = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round((correctCount / 5) / elapsedMinutes) : 0;
  const accuracy = typedCount > 0 ? Math.round((correctCount / typedCount) * 100) : 100;

  return (
    <div className="text-2xl text-white bg-black/50 p-6 border border-white flex justify-center items-center gap-4">
      <div className="items-center gap-4 max-w-[400px]">
        <div className="font-bold text-3xl">{playerName}</div>
        <Healthbar health={health} maxhealth={100} />
        
      </div>
      
      <div className="text-center">
        {/*
        <p className="font-semibold">คำศัพท์:</p>
        <p className="flex justify-center flex-wrap text-black font-['K2D'] text-2xl">
          {chars.map((char, idx) => {
            const state = typedIndexes[idx];
            const extra =
              state === "correct" ? "bg-green-200" :
              state === "incorrect" ? "bg-red-300" : "bg-white";
            return (
              <span key={idx} className={`text-lg mx-[2px] px-2 py-1 rounded transition-colors duration-200 ${extra}`}>
                {char}
              </span>
            );
          })}
        </p>
        <p className="mt-2">{message}</p>*/}
      </div>
    </div>
  );
}
