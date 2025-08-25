import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover text-white">
      <img src="/pic/logo/logorpg2.png" alt="" />
      
      <button 
        onClick={() => navigate("/stage-select")} 
        className="bg-[url(/pic/button480.png)] bg-no-repeat bg-cover w-[480px] h-auto px-6 py-3 text-2xl mb-15"
      >
        ▶ Play
      </button>
      <button 
        onClick={() => navigate("/options")} 
        className="bg-[url(/pic/button.png)] bg-no-repeat bg-cover w-[240px] h-auto px-6 py-3 text-2xl"
      >
        ⚙ Options
      </button>
    </div>
  );
}
