import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StageSelect() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(1);
  const [language, setLanguage] = useState("th");

  const startGame = () => {
    navigate("/game", { state: { difficulty, language } });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-700 text-white">
      <h2 className="text-3xl font-bold mb-4">เลือกด่าน</h2>
      <div className="flex gap-3 mb-6">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-4 py-2 rounded ${
              difficulty === lvl ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            ด่าน {lvl}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setLanguage((prev) => (prev === "th" ? "en" : "th"))}
          className="px-4 py-2 bg-blue-500 rounded"
        >
          {language === "th" ? "ภาษาไทย" : "English"}
        </button>
      </div>

      <button
        onClick={startGame}
        className="bg-red-500 px-6 py-3 rounded text-xl"
      >
        🚀 เริ่มเกม
      </button>
    </div>
  );
}
