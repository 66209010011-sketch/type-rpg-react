import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] text-white">
      <h1 className="text-5xl font-bold mb-8">Typing RPG</h1>
      <button 
        onClick={() => navigate("/stage-select")} 
        className="bg-[url(/pic/button.png)] px-6 py-3 text-2xl mb-4"
      >
        ▶ Play
      </button>
      <button 
        onClick={() => navigate("/options")} 
        className="bg-[url(/pic/button.png)] px-6 py-3 text-2xl"
      >
        ⚙ Options
      </button>
    </div>
  );
}
