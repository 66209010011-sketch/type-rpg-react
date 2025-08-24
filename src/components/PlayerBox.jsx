import React from 'react';

export default function Textbox({ word }) {
  return (
    <div className="flex justify-center items-center">
      <div
        className="w-[400px] h-[400px] bg-[url('/assets/pic/sign.png')] bg-center bg-no-repeat flex justify-center items-center text-white text-[64px] font-['Jersey_15'] text-center"
      >
        <p className="font-bold">
          Word<br />{word}
        </p>
      </div>
    </div>
  );
}
