import React from 'react';
import { splitByLanguage } from "../utils/thaiSplit";


export default function Textbox({ word, language, typedIndexes}) {
  const chars = splitByLanguage(word, language, "char");
  
  return (
    <div className="w-full text-center bg-black/50 p-4 border rounded border-white">
      <p className="font-semibold text-white text-2xl mb-2">คำศัพท์:</p>
      <p className="flex justify-center flex-wrap text-black font-['K2D'] text-4xl">
        {chars.map((char, idx) => {
          const state = typedIndexes[idx];
          const extra =
            state === "correct" ? "bg-green-200" :
            state === "incorrect" ? "bg-red-300" : "bg-white";
          return (
            <span 
              key={idx} 
              className={`mx-1 px-2 py-1 rounded transition-colors duration-200 ${extra}`}
            >
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
}

