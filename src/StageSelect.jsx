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
        className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 shadow-lg transition transform hover:scale-110"
        aria-label="Back to home"
      >
        <img
          src="/pic/returnarrow.png"
          alt="กลับหน้าแรก"
          className="w-12 h-12 sm:w-14 sm:h-14"
        />
      </button>
    <div className="bg-white/40 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
      <h2 className="text-3xl font-bold mb-4 shadow-lg">เลือกด่าน</h2>

      <div className="flex gap-3 mb-6 name">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded bg-cover bg-center transition-transform hover:scale-110`}
            style={{
              backgroundImage: `url(${
                difficulty === lvl 
                  ? "/pic/buttonsqhover.png"   // ✅ เมื่อเลือกแล้ว
                  : "/pic/buttonsq.png"        // ✅ ปกติ
              })`
            }}
          >
            <span className="text-white font-bold text-4xl">{lvl}</span>
          </button>
        ))}
      </div>


      <div className="mb-6 text-3xl font-bold ">
        เลือกภาษา<br />
        <button
          onClick={() => setLanguage((prev) => (prev === "th" ? "en" : "th"))}
          className="px-4 py-2 bg-purple-800 rounded mt-3"
        >
          {language === "th" ? "ภาษาไทย TH" : "English EN"}
        </button>
      </div>

      <button
        onClick={startGame}
        className="transition transform hover:scale-110"
      >
        <img src="/pic/startbutton.png" alt="" className="w-[12vw] h-auto" />
        
      </button>
      </div>
    </div>
  );
}
