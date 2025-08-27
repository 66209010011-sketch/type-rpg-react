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
    <div className="relative flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover text-white">
      {/* ปุ่มกลับหน้าแรก */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4"
      >
        <img
          src="/pic/returnarrow.png"
          alt="กลับหน้าแรก"
          className="w-20 h-20 hover:scale-130 transition-transform"
        />
      </button>

      <h2 className="text-3xl font-bold mb-4">เลือกด่าน</h2>

      <div className="flex gap-3 mb-6">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-4 py-4 rounded ${
              difficulty === lvl ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            ด่าน {lvl}
          </button>
        ))}
      </div>

      <div className="mb-6 text-3xl font-bold">
        เลือกภาษา<br />
        <button
          onClick={() => setLanguage((prev) => (prev === "th" ? "en" : "th"))}
          className="px-4 py-2 bg-purple-600 rounded mt-3"
        >
          {language === "th" ? "ภาษาไทย TH" : "English EN"}
        </button>
      </div>

      <button
        onClick={startGame}
        className="bg-purple-800 px-6 py-3 rounded text-xl"
      >
        🚀 เริ่มเกม
      </button>
    </div>
  );
}
