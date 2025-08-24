import React from 'react';
import { splitByLanguage } from "../utils/thaiSplit";


export default function Textbox({ word, language, typedIndexes}) {
  const chars = splitByLanguage(word, language, "char");
  
  return (
    <div className="text-center justify-end bg-black/50 p-6 border rounded border-white ">
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
    </div>
  );
}
