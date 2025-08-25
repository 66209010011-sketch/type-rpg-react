import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";  
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Textbox from "./components/PlayerBox";
import EnemyBox from "./components/EnemyBox";
import TypingBox from "./components/TypingBox";
import GameInfoBar from "./components/GameInfoBar";
import { splitByLanguage } from "./utils/thaiSplit.js";
import { db } from "./firebase";
import "./output.css";

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

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
  const [elapsedTime, setElapsedTime] = useState("0:00");

  // Effect states
  const [playerHit, setPlayerHit] = useState(false);
  const [damageText, setDamageText] = useState(null);

  // ✅ WPM และ Accuracy
  const [startTime, setStartTime] = useState(null);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // 🔹 เลือกเพลงตาม difficulty
  const getMusicByDifficulty = () => {
    switch (difficulty) {
      case 1:
        return "/music/firststatesong.mp3";
      case 2:
        return "/music/medium.mp3";
      case 3:
        return "/music/hard.mp3";
      default:
        return "/music/easy.mp3";
    }
  };

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
  }, [language, difficulty]);

  useEffect(() => {
  const loadEnemies = async () => {
    const qe = query(
      collection(db, "enemies"),
      where("difficulty", "==", difficulty),
      orderBy("order", "asc")   // ✅ เรียงตาม field order
    );
    const snapshot = await getDocs(qe);
    console.log("Snapshot docs:", snapshot.docs);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEnemies(data);

    if (data.length > 0) {
      const firstEnemy = data[0];   // ✅ ตัวแรกคือ order = 1
      setCurrentEnemy(firstEnemy);
      setEnemyMaxHealth(firstEnemy.health);
      setEnemyHealth(firstEnemy.health);
      setEnemyImage(firstEnemy.image);
      setEnemyName(firstEnemy.name);
    }
  };

  loadEnemies();
}, [difficulty]);

  // สลับศัตรูเมื่อ HP หมด
  useEffect(() => {
  if (enemyHealth !== null && enemyHealth <= 0 && enemies.length > 0) {
    const currentIndex = enemies.findIndex(e => e.id === currentEnemy.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < enemies.length) {
      const nextEnemy = enemies[nextIndex];  // ✅ เลือกศัตรูถัดไปตาม order
      setCurrentEnemy(nextEnemy);
      setEnemyMaxHealth(nextEnemy.health);
      setEnemyHealth(nextEnemy.health);
      setEnemyImage(nextEnemy.image);
      setEnemyName(nextEnemy.name);
      setTypedIndexes([]);
      setInputValue("");
    } else {
      console.log("🎉 ศัตรูหมดแล้ว เคลียร์ด่าน!");
      // 👉 ตรงนี้คุณจะใส่ logic เช่นไปหน้าชนะเกม หรือวน loop ต่อก็ได้
    }
  }
}, [enemyHealth, enemies, currentEnemy]);

  const enemyChars = splitByLanguage(enemyWord, language, "char");

  const handleTyping = (text) => {
    if (!startTime) setStartTime(Date.now()); // เริ่มจับเวลาครั้งแรก

    const inputChars = splitByLanguage(text, language);
    const newStatuses = [];

    for (let i = 0; i < inputChars.length; i++) {
      const status = inputChars[i] === enemyChars[i] ? "correct" : "incorrect";
      newStatuses[i] = status;

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

    const correctNow = newStatuses.filter((x) => x === "correct").length;
    const accuracy = (correctNow / enemyChars.length) * 100;

    if (inputChars.length === enemyChars.length && wordList.length > 0) {
      if (accuracy >= 75) {
        const damage = enemyChars.length * 1;
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

      setTypedIndexes([]);
      setInputValue("");
      const newWord = wordList[Math.floor(Math.random() * wordList.length)];
      setEnemyWord(newWord);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "th" ? "en" : "th"));
    setStartTime(null);
    setTypedCount(0);
    setCorrectCount(0);
  };

  const openWordManager = () => {
    window.open("/word-manager", "_blank");
  };

  // ตัวจับเวลา
  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        const diffMs = Date.now() - startTime;
        const totalSeconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        setElapsedTime(formatted);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime]);

  // จัดการเพลง
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.10;
      audioRef.current.play().catch(() => {
        console.log("Auto-play ถูกบล็อก ต้องให้ user กด interaction ก่อน");
      });
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = 0.10;
      audioRef.current.play().catch(() => {});
    }
  }, [difficulty]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  return (
    <div className="p-4 relative">
      {playerHit && <div className="player-hit-overlay"></div>}

      {/* เพลงแบ็คกราวด์ */}
      <audio ref={audioRef} autoPlay loop>
        <source src={getMusicByDifficulty()} type="audio/mpeg" />
      </audio>

      {/* ปุ่มปิด/เปิดเสียง */}
      <button
        onClick={toggleMute}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-110 ${
          isMuted ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Header */}
      <div className="flex items-center w-full mb-4">
        <img
          src="pic/logo/logotrpg.png"
          alt="logo"
          className="object-cover w-[20vw] h-[10vw]"
        />
        <div className="flex gap-2">
          <button
            onClick={openWordManager}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            จัดการคำศัพท์
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Textbox
            word={enemyWord}
            typedIndexes={typedIndexes}
            language={language}
          />
        </div>

        <div className="flex justify-end mt-10 mr-20">
          <div
            className={`enemy-box ${
              enemyShake ? "enemy-shake" : "enemy-float"
            }`}
          >
            <EnemyBox
              image={enemyImage}
              health={enemyHealth}
              name={enemyname}
              maxhealth={enemyMaxHealth}
            />
            {damageText && <div className="damage-float">{damageText}</div>}
          </div>
        </div>
      </div>

      <GameInfoBar
        word={enemyWord}
        typedIndexes={typedIndexes}
        health={health}
        playerName={playerName}
        language={language}
        startTime={startTime}
        typedCount={typedCount}
        correctCount={correctCount}
        elapsedTime={elapsedTime}
      />

      <TypingBox onTyping={handleTyping} inputValue={inputValue} />
    </div>
  );
}
