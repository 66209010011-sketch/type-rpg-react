import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

// จัดเรียงคีย์ stage แบบธรรมชาติ: stage1 < stage2 < ... < stage10
const naturalStageSort = (a, b) => {
  const na = parseInt(String(a).replace(/\D/g, "") || "0", 10);
  const nb = parseInt(String(b).replace(/\D/g, "") || "0", 10);
  if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
  if (na === nb) return a.localeCompare(b);
  return na - nb;
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลจาก Firestore: users/*/progress/stageX/highScore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));

        const rows = snapshot.docs.map((doc) => {
          const data = doc.data() || {};
          const progress = data.progress || {};

          const highScores = {};
          let totalScore = 0;

          Object.keys(progress).forEach((stageKey) => {
            const node = progress[stageKey] || {};
            // ป้องกัน NaN / undefined / string แปลกๆ
            const val = Number(node.highScore);
            const score = Number.isFinite(val) ? val : 0;
            highScores[stageKey] = score;
            totalScore += score;
          });

          return {
            id: doc.id,
            name: data.displayName || "Guest",
            highScores,
            totalScore,
          };
        });

        // สร้างรายการ stage ทั้งหมดจากทุกผู้เล่น แล้ว sort
        const stageNames = Array.from(
          new Set(
            rows.flatMap((r) => Object.keys(r.highScores))
          )
        ).sort(naturalStageSort);

        // เรียงตาม totalScore ก่อนเซต
        rows.sort((a, b) => b.totalScore - a.totalScore);

        setLeaders(rows);
        setStages(stageNames);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // หา max ของแต่ละ stage เพื่อทำไฮไลต์ผู้ที่ได้สูงสุด (และ > 0)
  const stageMax = useMemo(() => {
    const m = {};
    stages.forEach((s) => {
      m[s] = Math.max(
        0,
        ...leaders.map((p) => Number(p.highScores?.[s] || 0))
      );
    });
    return m;
  }, [stages, leaders]);

  return (
   <div className="flex flex-col items-center bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover min-h-screen px-4 relative">
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

  {/* หัวข้อ Leaderboard */}
  <img
    src="/pic/leaderboard.png"
    alt="Leaderboard"
    className="mt-6 mb-4 w-[70%] sm:w-[40%] max-w-lg drop-shadow-xl leaderboard-title"
  />

  {/* ตาราง */}
  <div className="w-full max-w-6xl bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl overflow-x-auto border border-gray-200">
    {loading ? (
      <p className="text-center py-6 text-gray-500">Loading...</p>
    ) : (
      <table className="w-full border-collapse text-center min-w-max">
        <thead>
          <tr className="bg-gray-800 text-white text-lg">
            <th className="border px-4 py-3 w-14">#</th>
            <th className="border px-4 py-3 min-w-[180px]">ชื่อผู้เล่น</th>
            {stages.map((stage, i) => (
              <th key={stage} className="border px-4 py-3">
                {`ด่านที่ ${i + 1}`}
              </th>
            ))}
            <th className="border px-4 py-3 min-w-[140px]">คะแนนรวมทั้งหมด</th>
          </tr>
        </thead>

        <tbody>
          {leaders.slice(0, 10).map((player, index) => (
            <tr
              key={player.id}
              className={`transition hover:bg-gray-100 ${
                index === 0
                  ? "bg-yellow-100 font-semibold text-gray-900"
                  : "text-gray-800"
              }`}
            >
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2 text-left">
                <div className="truncate">{player.name}</div>
              </td>

              {stages.map((stage) => {
                const score = Number(player.highScores?.[stage] || 0);
                const isTop = score > 0 && score === stageMax[stage];
                return (
                  <td
                    key={stage}
                    className={`border px-4 py-2 ${
                      isTop
                        ? "bg-green-100 font-semibold text-green-700"
                        : ""
                    }`}
                  >
                    {score}
                  </td>
                );
              })}

              <td className="border px-4 py-2 font-bold text-indigo-700">
                {player.totalScore}
              </td>
            </tr>
          ))}

          {/* กรณีไม่มีข้อมูล */}
          {leaders.length === 0 && !loading && (
            <tr>
              <td
                className="border px-4 py-6 text-gray-500"
                colSpan={stages.length + 3}
              >
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>

  {/* หมายเหตุเล็กน้อย */}
  <p className="text-sm text-gray-700 mt-3 bg-white/70 backdrop-blur-md px-3 py-1 rounded-md shadow">
    * Highlight สีเขียว = คะแนนสูงสุดของด่านนั้น (เฉพาะคะแนน &gt; 0)
  </p>
</div>

  );
}
