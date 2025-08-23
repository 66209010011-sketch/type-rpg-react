import React, { useState, useEffect } from "react";
import PlayerBox from "./components/PlayerBox";
import EnemyBox from "./components/EnemyBox";
import TypingBox from "./components/TypingBox";
import GameInfoBar from "./components/GameInfoBar";
import Healthbar from "./components/Healthbar";
import { splitByLanguage } from "./utils/thaiSplit.js";
import "./output.css";

// Firebase
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const enemyImages = [
  "src/assets/pic/enemies/enemy1.png",
  "src/assets/pic/enemies/enemy2.png",
  "src/assets/pic/enemies/enemy3.png",
  "src/assets/pic/enemies/enemy4.png",
  "src/assets/pic/enemies/enemy5.png",
];

export default function App() {
  const [enemyWord, setEnemyWord] = useState("");
  const [typedIndexes, setTypedIndexes] = useState([]);
  const [health, setPlayerHP] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState("th");
  const [wordList, setWordList] = useState([]);
  const [enemyShake, setEnemyShake] = useState(false);
  const [enemyImage, setEnemyImage] = useState(null);
  const playerName = "นักรบ";

  // Effect states
  const [playerHit, setPlayerHit] = useState(false);
  const [damageText, setDamageText] = useState(null);

  // ✅ WPM และ Accuracy
  const [startTime, setStartTime] = useState(null);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // โหลดคำจาก Firebase
  useEffect(() => {
    const loadWords = async () => {
      const q = query(
        collection(db, "words"),
        where("language", "==", language.toUpperCase())
      );
      const snapshot = await getDocs(q);
      const words = snapshot.docs.map((doc) => doc.data().word);
      setWordList(words);

      if (words.length > 0) {
        const newWord = words[Math.floor(Math.random() * words.length)];
        setEnemyWord(newWord);
        setEnemyImage(enemyImages[Math.floor(Math.random() * enemyImages.length)]);
      }
    };
    loadWords();
  }, [language]);

  // สลับศัตรูเมื่อ HP หมด
  useEffect(() => {
    if (enemyHealth <= 0 && wordList.length > 0) {
      setEnemyHealth(100);
      const newWord = wordList[Math.floor(Math.random() * wordList.length)];
      setEnemyWord(newWord);
      setEnemyImage(enemyImages[Math.floor(Math.random() * enemyImages.length)]);
      setTypedIndexes([]);
      setInputValue("");
    }
  }, [enemyHealth, wordList]);

  const enemyChars = splitByLanguage(enemyWord, language, "char");

  const handleTyping = (text) => {
    if (!startTime) setStartTime(Date.now()); // เริ่มจับเวลาครั้งแรก

    const inputChars = splitByLanguage(text, language);
    const newStatuses = [];

    for (let i = 0; i < inputChars.length; i++) {
      const status = inputChars[i] === enemyChars[i] ? "correct" : "incorrect";
      newStatuses[i] = status;

      // ✅ นับจำนวนพิมพ์
      if (typedIndexes[i] !== status) {
        setTypedCount((c) => c + 1);
        if (status === "correct") setCorrectCount((c) => c + 1);
      }
    }

    setTypedIndexes(newStatuses);
    setInputValue(text);

    // Accuracy
    const correctNow = newStatuses.filter((x) => x === "correct").length;
    const accuracy = (correctNow / enemyChars.length) * 100;

    // จบคำ
    if (inputChars.length === enemyChars.length && wordList.length > 0) {
      if (accuracy >= 75) {
        const damage = enemyChars.length * 1; // difficulty
        setEnemyHealth((prev) => Math.max(prev - damage, 0));
        setEnemyShake(true);
        setDamageText(damage);
        setTimeout(() => setDamageText(null), 800);
        setTimeout(() => setEnemyShake(false), 400);
      } else {
        setPlayerHP((prev) => Math.max(prev - 5, 0));
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 300);
      }

      // รีเซ็ตการพิมพ์
      setTypedIndexes([]);
      setInputValue("");
      const newWord = wordList[Math.floor(Math.random() * wordList.length)];
      setEnemyWord(newWord);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "th" ? "en" : "th"));
    // ✅ รีเซ็ตตัวนับเมื่อเปลี่ยนภาษา
    setStartTime(null);
    setTypedCount(0);
    setCorrectCount(0);
  };

  const openWordManager = () => {
    window.open("/word-manager", "_blank");
  };

  return (
    <div className="p-4 relative">
      {playerHit && <div className="player-hit-overlay"></div>}

      {/* Logo + Buttons */}
      <div className="flex items-center justify-between w-full mb-4">
        <img
          src="src/assets/pic/logo/logotrpg.png"
          alt="logo"
          className="object-cover w-[20vw] h-[10vw]"
        />

        <div className="flex gap-2">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {language === "th" ? "เปลี่ยนเป็น English" : "เปลี่ยนเป็น ภาษาไทย"}
          </button>
          <button
            onClick={openWordManager}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            จัดการคำศัพท์
          </button>
        </div>
      </div>

      {/* Enemy */}
      <div className="flex justify-center items-center my-5">
        <div className={`relative enemy-box ${enemyShake ? "enemy-shake" : ""}`}>
          <EnemyBox image={enemyImage} health={enemyHealth} />
          {damageText && <div className="damage-float">{damageText}</div>}
        </div>
      </div>

      {/* InfoBar */}
      <GameInfoBar
        word={enemyWord}
        typedIndexes={typedIndexes}
        health={health}
        playerName={playerName}
        language={language}
        startTime={startTime}
        typedCount={typedCount}
        correctCount={correctCount}
      />

      <TypingBox onTyping={handleTyping} inputValue={inputValue} />
    </div>
  );
}
