import React from "react";
import Healthbar from "./Healthbar";
import { splitByLanguage } from "../utils/thaiSplit"; // <- path อาจต่างตามโครงสร้างโปรเจ็กต์

export default function GameInfoBar({ health, playerName,  startTime, typedCount, correctCount, elapsedTime}) {
  const elapsedMinutes = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round((correctCount / 5) / elapsedMinutes) : 0;
  const accuracy = typedCount > 0 ? Math.round((correctCount / typedCount) * 100) : 100;

  return (
    <div className="text-2xl text-white bg-black/50 p-6 border border-white flex justify-center items-center gap-4">
      <div className="items-center gap-4 max-w-[400px]">
        <div className="font-bold text-3xl">{playerName}</div>
        <Healthbar health={health} maxhealth={100} />
        
      </div>
      
      <div className="mt-4 flex justify-center gap-6 font-['Bitcount']">
        <div className="flex items-center gap-4">
          <img src="pic/wpm.png" alt="" className="w-[7vw]" />
          <span className="font-bold text-3xl">{wpm}</span>
          <img src="pic/accuracy.png" alt="" className="w-[7vw]" />
          <span className="font-bold text-3xl">{accuracy}%</span>
          <img src="pic/time.png" alt="" className="w-[7vw]" />
          <span className="font-bold text-3xl">{elapsedTime}</span>
        </div>
      </div>

    </div>
  );
}
