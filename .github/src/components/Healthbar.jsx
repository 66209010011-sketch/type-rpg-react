import React from "react";

export default function Healthbar({ health, maxhealth }) {
  const percentage = (health / maxhealth) * 100;

  const getBarColor = () => {
    if (percentage > 75) return "bg-green-500";
    if (percentage > 50) return "bg-yellow-400";
    if (percentage > 25) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div className="w-[400px] h-10 bg-white border-4 border-black rounded shadow-md">
      {percentage === 0 ? (
        <div className="h-full bg-black text-sm font-bold text-center">DEATH</div>
      ) : (
        <div
          className={`h-full ${getBarColor()} flex items-center justify-center transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` , imageRendering: "pixelated" }}
        >
          <span className="text-white text-sm font-bold">
            {Math.floor(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
