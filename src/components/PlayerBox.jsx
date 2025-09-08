import React from 'react';
import { splitByLanguage } from "../utils/thaiSplit";

export default function Textbox({ word, language, typedIndexes }) {
  const chars = splitByLanguage(word, language, "char");

  return (
    <div className="text-center bg-black/50 p-6 border rounded border-white min-w-[25vw] w-max max-w-[60vw] mx-auto">
      <p className="font-semibold text-white text-2xl mb-2">คำศัพท์:</p>
      <p className="flex justify-center font-['K2D'] text-5xl text-center px-4 flex-nowrap">
        {chars.map((char, idx) => {
          const state = typedIndexes[idx];
          const color =
            state === "correct" ? "text-green-400" :
            state === "incorrect" ? "text-red-400" :
            "text-white"; // ยังไม่ได้พิมพ์
          
          return (
            <span
              key={idx}
              className={`mx-[2px] transition-colors duration-200 ${color}`}
            >
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
}
