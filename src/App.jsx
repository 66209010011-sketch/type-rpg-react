import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  
import Textbox from "./components/PlayerBox";
import EnemyBox from "./components/EnemyBox";
import TypingBox from "./components/TypingBox";
import GameInfoBar from "./components/GameInfoBar";
import Healthbar from "./components/Healthbar";
import { splitByLanguage } from "./utils/thaiSplit.js";
import "./output.css";

// Firebase
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function App() {
  const playSound = (file) => {
  const audio = new Audio(file);
  audio.play();
  };
  const location = useLocation();
  const { difficulty, language: initialLanguage } = location.state || {
    difficulty: 1,
    language: "th",
  };
  const [enemies, setEnemies] = useState([]);
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [enemyWord, setEnemyWord] = useState("");
  const [typedIndexes, setTypedIndexes] = useState([]);
  const [health, setPlayerHP] = useState(100);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState(initialLanguage);
  const [wordList, setWordList] = useState([]);
  const [enemyShake, setEnemyShake] = useState(false);
  const [enemyHealth, setEnemyHealth] = useState(null);
  const [enemyMaxHealth, setEnemyMaxHealth] = useState(null);
  const [enemyImage, setEnemyImage] = useState("");
  const [enemyname, setEnemyName] = useState("");
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
        where("language", "==", language.toUpperCase()),
        where("difficulty", "==", difficulty)
      );
      const snapshot = await getDocs(q);
      const words = snapshot.docs.map((doc) => doc.data().word);
      setWordList(words);

      if (words.length > 0) {
        const newWord = words[Math.floor(Math.random() * words.length)];
        setEnemyWord(newWord);
      }
    };
    loadWords();
  }, [language]);

  useEffect(() => {
      const loadEnemies = async () => {
          const qe = query(
          collection(db, "enemies"),
          where("difficulty", "==", difficulty)
        );
        const snapshot = await getDocs(qe);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnemies(data);

        if (data.length > 0) {
          const enemy = data[Math.floor(Math.random() * data.length)];
          setCurrentEnemy(enemy);
          setEnemyMaxHealth(enemy.health);
          setEnemyHealth(enemy.health);   // ต้องเซ็ตเลือดจริงด้วย
          setEnemyImage(enemy.image);
          setEnemyName(enemy.name);
        }
      };

      loadEnemies();
    }, []);

  // สลับศัตรูเมื่อ HP หมด
useEffect(() => {
  if (enemyHealth !== null && enemyHealth <= 0 && enemies.length > 0) {
    const newEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    setCurrentEnemy(newEnemy);
    setEnemyMaxHealth(newEnemy.health);
    setEnemyHealth(newEnemy.health);  // รีเซ็ตเลือดใหม่
    setEnemyImage(newEnemy.image);
    setEnemyName(newEnemy.name);
    setTypedIndexes([]);
    setInputValue("");
  }
}, [enemyHealth, enemies]);  // ✅ ใช้ enemyHealth



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
        if (status === "correct") {
          setCorrectCount((c) => c + 1);
          playSound("/sound/correct.wav");
        } 
        if (status === "incorrect") {
          playSound("/sound/incorrect.wav");
        }
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
        playSound("/sound/enemyhit.mp3");
      } else {
        setPlayerHP((prev) => Math.max(prev - 5, 0));
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 300);
        playSound("/sound/playerhit.wav");
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
      <div className="flex items-center justify-between w-full mb-4 relative">
        <img
          src="pic/logo/logotrpg.png"
          alt="logo"
          className="object-cover w-[20vw] h-[10vw]"
        />

        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2">
          <Textbox 
            word={enemyWord}
            typedIndexes={typedIndexes}
            language={language}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open("/options", "_blank")}
            className="p-2 bg-gray-700 text-white rounded-full"
          >
            ⚙
          </button>
          <button
            onClick={openWordManager}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            จัดการคำศัพท์
          </button>
        </div>
      </div>

      <div className="relative my-5 flex justify-center">
        {/* EnemyBox อยู่กลาง ไม่ขยับ */}
        <div className={`relative enemy-box ${enemyShake ? "enemy-shake" : ""}`}>
          <EnemyBox 
            image={enemyImage} 
            health={enemyHealth} 
            name={enemyname} 
            maxhealth={enemyMaxHealth}
          />
          {damageText && <div className="damage-float">{damageText}</div>}
        </div>

        {/* Textbox ชิดขวาสุดแบบ absolute */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Textbox 
            word={enemyWord}
            typedIndexes={typedIndexes}
            language={language}
          />
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
