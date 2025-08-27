import React from 'react';
import { splitByLanguage } from "../utils/thaiSplit";


export default function Textbox({ word, language, typedIndexes}) {
  const chars = splitByLanguage(word, language, "char");

  return (
    <div className="text-center bg-black/50 p-6 border rounded border-white w-[25vw]">
      <p className="font-semibold text-white text-2xl mb-2">คำศัพท์:</p>
      <p className="flex justify-center text-black font-['K2D'] text-4xl text-center">
        {chars.map((char, idx) => {
          const state = typedIndexes[idx];
          const extra =
            state === "correct" ? "bg-green-200" :
            state === "incorrect" ? "bg-red-300" : "bg-white";
          return (
            <span key={idx} className={`mx-[2px] px-2 py-1 rounded transition-colors duration-200 ${extra}`}>
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
}


