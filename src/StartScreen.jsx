import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover text-white">
      <img src="/pic/logo/logotypingadventure2.png" alt="" className="w-[40vw]"/>
    <div className="relative w-[50vw] max-w-[350px] aspect-[5/2] mb-6">
      <img src="/pic/button480.png" alt="Play Button" className="w-full h-full object-contain" />
      <button
        onClick={() => navigate("/stage-select")}
        className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl text-white transform transition-transform hover:scale-120"
      >
        ▶ Play
      </button>
    </div>


    </div>
  );
}
