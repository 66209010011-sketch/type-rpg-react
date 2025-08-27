import React, { useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";

const ResultPopup = ({ isWin, wpm, accuracy, score, difficulty, onClose, onRestart }) => {
    const navigate = useNavigate();
  useEffect(() => {
    const saveScore = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const stageKey = `stage${difficulty}`;

      try {
        // ดึง progress เดิมมาก่อน
        const snap = await getDoc(userRef);
        let existingProgress = {};
        if (snap.exists()) {
          existingProgress = snap.data().progress || {};
        }

        const oldStage = existingProgress[stageKey] || { highScore: 0, wpm: 0, accuracy: 0 };

        const newStage = {
          highScore: Math.max(oldStage.highScore, score),
          wpm: Math.max(oldStage.wpm, wpm),
          accuracy: Math.max(oldStage.accuracy, accuracy),
          lastPlayed: new Date().toISOString(),
        };

        await setDoc(
          userRef,
          {
            progress: {
              ...existingProgress,
              [stageKey]: newStage,
            },
          },
          { merge: true }
        );

        console.log(`✅ Saved progress for ${stageKey}`, newStage);
      } catch (err) {
        console.error("🔥 Error saving score:", err);
      }
    };

    saveScore();
  }, [score, wpm, accuracy, difficulty]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[400px] text-center scale-100 transition transform duration-300">
        <h2 className={`text-2xl font-bold mb-4 ${isWin ? "text-green-600" : "text-red-600"}`}>
          {isWin ? "🎉 ด่านเคลียร์!" : "💀 คุณแพ้!"}
        </h2>

        <p className="text-lg">WPM: <span className="font-semibold">{wpm}</span></p>
        <p className="text-lg">Accuracy: <span className="font-semibold">{accuracy}%</span></p>
        <p className="text-lg">Score: <span className="font-bold text-blue-600">{score}</span></p>
        {difficulty && <p className="text-lg mb-4">Difficulty: <span className="font-semibold">{difficulty}</span></p>}

        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => navigate("/stage-select")} 
            className="px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition"
          >
            เลือกด่าน
          </button>
          <button 
            onClick={onRestart} 
            className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
          >
            เล่นใหม่
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
