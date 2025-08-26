import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const leaderboardData = snapshot.docs.map(doc => {
        const data = doc.data();

        // แปลง stage map เป็น highScores
        const highScores = {};
        Object.keys(data).forEach(key => {
          const stageData = data[key];
          if (stageData && typeof stageData === "object" && key.toLowerCase().startsWith("stage")) {
            highScores[key] = stageData.highScore || 0;
          }
        });

        // รวมคะแนนทั้งหมด
        const totalScore = Object.values(highScores).reduce((acc, val) => acc + val, 0);

        return {
          id: doc.id,
          name: data.displayName || "Guest",
          highScores,
          totalScore,
        };
      });

      setLeaders(leaderboardData);

      // เก็บชื่อ stage ทั้งหมด
      const stageNames = Array.from(
        new Set(
          leaderboardData.flatMap(player => Object.keys(player.highScores))
        )
      );
      setStages(stageNames);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // หา max score ของแต่ละ stage (เพื่อไฮไลต์)
  const getMaxScore = stage => {
    return Math.max(...leaders.map(player => player.highScores[stage] || 0));
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4 relative">
      {/* ปุ่มกลับหน้าแรก */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4"
      >
        <img
          src="/pic/returnarrow.png"
          alt="กลับหน้าแรก"
          className="w-20 h-20 hover:scale-110 transition-transform"
        />
      </button>

      <h2 className="text-2xl font-bold mb-6">Leaderboard - Total Score</h2>

      {/* ตาราง Leaderboard */}
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full border-collapse text-center min-w-max">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Player</th>
                {stages.map(stage => (
                  <th key={stage} className="border px-4 py-2">{stage}</th>
                ))}
                <th className="border px-4 py-2">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {leaders
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 10)
                .map((player, index) => (
                  <tr
                    key={player.id}
                    className={`hover:bg-gray-50 ${index === 0 ? "bg-yellow-100 font-bold" : ""}`}
                  >
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{player.name}</td>
                    {stages.map(stage => {
                      const score = player.highScores[stage] || 0;
                      const isTop = score === getMaxScore(stage) && score > 0;
                      return (
                        <td
                          key={stage}
                          className={`border px-4 py-2 ${isTop ? "bg-green-200 font-semibold" : ""}`}
                        >
                          {score}
                        </td>
                      );
                    })}
                    <td className="border px-4 py-2 font-semibold">{player.totalScore}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
