import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Options() {
  const navigate = useNavigate();
  const [volume, setVolume] = useState(
    localStorage.getItem("volume") || 50
  );

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setVolume(val);
    localStorage.setItem("volume", val); // เก็บค่าไว้ใช้ต่อ
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-6">Options</h2>
      <label className="mb-4">
        เสียง: {volume}%
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="ml-2"
        />
      </label>
      <button
        onClick={() => navigate("/")}
        className="bg-gray-600 px-6 py-3 rounded"
      >
        🔙 กลับเมนูหลัก
      </button>
    </div>
  );
}
