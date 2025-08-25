import Healthbar from "./Healthbar";
import { splitByLanguage } from "../utils/thaiSplit";

export default function EnemyBox({ image, health, maxhealth, word, language, typedIndexes, name }) {
  const chars = splitByLanguage(word, language, "char");

  return (
    <div className="flex flex-col items-center">
      {/* ✅ กล่องคำศัพท์อยู่บนหลอดเลือด */}
      <div className="text-center justify-end bg-black/50 p-6 border rounded border-white ">
      <p className="font-semibold text-white">คำศัพท์:</p>
        <p className="flex justify-center flex-wrap text-black font-['K2D'] text-2xl">
          {chars.map((char, idx) => {
              const state = typedIndexes[idx];
              const extra =
              state === "correct" ? "bg-green-200" :
              state === "incorrect" ? "bg-red-300" : "bg-white";
            return (
              <span key={idx} className={`text-lg mx-[2px] px-2 py-1 rounded transition-colors duration-200 ${extra}`}>
                {char}
              </span>
            );
          })}
        </p>
    </div>

      {/* ✅ หลอดเลือด Enemy */}
      <div className="w-[40vw] sm:w-[20vw] mb-1">
        <Healthbar health={health} maxhealth={maxhealth} />
      </div>

      {/* ชื่อศัตรู */}
      <p className="text-lg sm:text-xl font-bold mt-1">{name || "Enemy"}</p>

      {/* รูป Enemy */}
      <img
        src={image}
        alt="enemy"
        className="w-[30vw] sm:w-[18vw] h-auto object-contain"
      />
    </div>
  );
}
