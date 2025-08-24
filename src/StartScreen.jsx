import React from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-5xl font-bold mb-8">Typing RPG</h1>
      <button 
        onClick={() => navigate("/stage-select")} 
        className="bg-green-500 px-6 py-3 rounded text-2xl mb-4"
      >
        ▶ Play
      </button>
      <button 
        onClick={() => navigate("/options")} 
        className="bg-blue-500 px-6 py-3 rounded text-2xl"
      >
        ⚙ Options
      </button>
    </div>
  );
}
