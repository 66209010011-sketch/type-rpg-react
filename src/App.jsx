import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";  
import { collection, getDocs, query, where, orderBy} from "firebase/firestore";
import Textbox from "./components/PlayerBox";
import EnemyBox from "./components/EnemyBox";
import TypingBox from "./components/TypingBox";
import GameInfoBar from "./components/GameInfoBar";
import ResultPopup from "./components/ResultPopup.jsx";
import { splitByLanguage } from "./utils/thaiSplit.js";
import { db } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./output.css";

export default function App() {
  const navigate = useNavigate();
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
  const calculateStats = () => {
  if (!startTime) {
    return { wpm: 0, accuracy: 0 }; // ยังไม่เริ่มเล่น = สถิติเป็น 0
  }

  const minutes = (Date.now() - startTime) / 60000;
  const safeMinutes = minutes > 0 ? minutes : 1; // กันหาร 0

  const wpm = Math.round((typedCount / 5) / safeMinutes);
  const accuracy =
    typedCount > 0 ? Math.round((correctCount / typedCount) * 100) : 0;

  return { wpm, accuracy };
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
  const [playerShake, setplayerShake] = useState(false); 
  const [enemyHealth, setEnemyHealth] = useState(null);
  const [enemyMaxHealth, setEnemyMaxHealth] = useState(null);
  const [enemyImage, setEnemyImage] = useState("");
  const [enemyname, setEnemyName] = useState("");
  const [playerName, setplayerName] = useState("Guest");
  const [elapsedTime, setElapsedTime] = useState("0:00");
  
  const [showResult, setShowResult] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [score, setScore] = useState(0);

  // Effect states
  const [playerHit, setPlayerHit] = useState(false);
  const [damageText, setDamageText] = useState(null);

  // ✅ WPM และ Accuracy
  const [startTime, setStartTime] = useState(null);
  const [typedCount, setTypedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // สมมติ collection ของคุณชื่อ "users" และ document ID คือ user.uid
        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setplayerName(userData.displayName || "Player");
        } else {
          setplayerName("Player");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setplayerName("Player");
      }
    } else {
      setplayerName("Guest");
    }
  });

  return () => unsubscribe();
}, []);

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

  const calculateFinalScore = (wpm, accuracy, isWin) => {
    let multiplier = 1;
    switch (Number(difficulty)) {
      case 1: multiplier = 1.0; break;
      case 2: multiplier = 1.5; break;
      case 3: multiplier = 2.0; break;
      case 4: multiplier = 2.5; break;
      case 5: multiplier = 3.0; break;
      default: multiplier = 1.0;
    }

    let baseScore = wpm * accuracy * multiplier;
    if (isWin) {
      baseScore += 100; // ✅ bonus ผ่านด่าน
    } else {
      baseScore *= 0.7; // ❌ penalty แพ้
    }
    return Math.floor(baseScore);
  };


  // ✅ เมื่อชนะ
  const handleWin = () => {
    const { wpm, accuracy } = calculateStats();
    const finalScore = calculateFinalScore(wpm, accuracy, true);
    setWpm(wpm);
    setAccuracy(accuracy);
    setScore(finalScore);
    setIsWin(true);
    setShowResult(true);
  };

  // ❌ เมื่อแพ้
  const handleLose = () => {
    const { wpm, accuracy } = calculateStats();
    const finalScore = calculateFinalScore(wpm, accuracy, false);
    setWpm(wpm);
    setAccuracy(accuracy);
    setScore(finalScore);
    setIsWin(false);
    setShowResult(true);
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
    try {
      console.log("📥 Loading enemies... difficulty =", difficulty);

      const qe = query(
        collection(db, "enemies"),
        where("difficulty", "==", Number(difficulty)),  // ✅ บังคับเป็น number
        orderBy("order", "asc")
      );

      const snapshot = await getDocs(qe);
      console.log("📦 Raw snapshot size:", snapshot.size);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Enemies data:", data);

      setEnemies(data);

      if (data.length > 0) {
        const firstEnemy = data[0];
        console.log("🎯 First enemy:", firstEnemy);

        setCurrentEnemy(firstEnemy);
        setEnemyMaxHealth(firstEnemy.health);
        setEnemyHealth(firstEnemy.health);
        setEnemyImage(firstEnemy.image);
        setEnemyName(firstEnemy.name);
      } else {
        console.warn("⚠️ No enemies found for difficulty =", difficulty);
      }
    } catch (err) {
      console.error("🔥 Error loading enemies:", err);
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
      handleWin();
    }
  }
}, [enemyHealth, enemies, currentEnemy]);

useEffect(() => {
  if (health <= 0) {
    console.log("💀 ผู้เล่น HP หมด แพ้เกม!");
    handleLose(); // เรียก popup แพ้
  }
}, [health]);

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
    const currentaccuracy = 
    enemyChars.length > 0
    ? (correctNow / enemyChars.length) * 100
    : 0;


    if (inputChars.length === enemyChars.length && wordList.length > 0) {
      if (currentaccuracy >= 75) {
        const damage = enemyChars.length * 1;
        setEnemyHealth((prev) => Math.max(prev - damage, 0));
        setEnemyShake(true);
        setDamageText(damage);
        setTimeout(() => setDamageText(null), 800);
        setTimeout(() => setEnemyShake(false), 400);
        playSound("/sound/enemyhit.mp3");
      } else {
        setPlayerHP((prev) => Math.max(prev - 5, 0));
        setplayerShake(true);
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 300);
        setTimeout(() => setplayerShake(false), 400);
        playSound("/sound/playerhit.wav");
      }

      setTypedIndexes([]);
      setInputValue("");
      const newWord = wordList[Math.floor(Math.random() * wordList.length)];
      setEnemyWord(newWord);
    }
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
  const getBackgroundByDifficulty = () => {
    switch (difficulty) {
      case 1:
        return "/pic/scene/stage1.gif";
      case 2: 
        return "/pic/scene/stage2.gif";  
      case 3: 
        return "/pic/scene/stage3.gif"; 
      case 4:
        return "/pic/scene/stage4.gif";
      case 5:
        return "/pic/scene/stage5.gif";
      default: return "/pic/scene/default.png";
    }
  };

  return (
    <div 
      className="p-4 relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${getBackgroundByDifficulty()})` }}
    > 
      {!showResult && (
      <>
        {playerHit && <div className="player-hit-overlay"></div>}

        {/* เพลงแบ็คกราวด์ */}
        <audio ref={audioRef} autoPlay loop>
          <source src={getMusicByDifficulty()} type="audio/mpeg" />
        </audio>

        <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
          {/* ปุ่มกลับหน้าแรก */}
          <button
            onClick={() => {
              const confirmExit = window.confirm("คุณต้องการกลับไปหน้าแรกจริงๆ ใช่ไหม?");
              if (confirmExit) {
                navigate("/");
              }
            }}
          >
            <img
              src="/pic/returnarrow.png"
              alt="กลับหน้าแรก"
              className="w-16 h-16 hover:scale-110 transition-transform"
            />
          </button>

          {/* ปุ่มปิด/เปิดเสียง */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-110 ${
              isMuted ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>

        {/* Header */}
        <div className="flex fixed items-center w-full mb-4">
          <img
            src="/pic/logo/logotypingadventure.png"
            alt="logo"
            className="object-cover w-[30vw] h-[10vw]"
          />
          {/*
          <div className="flex gap-2">
            <button
              onClick={openWordManager}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              จัดการคำศัพท์
            </button>
          </div>
          */}
        </div>
        <div className="flex items-center justify-between mt-40 px-20">
          {/* Player */}
          <div
            className={`player-box ${playerShake ? "player-shake" : "player-float"}`}
          >
            <div className="text-center text-5xl font-bold text-white text-shadow-lg/30 name mb-2">
              {playerName}
            </div>
            <img src="/pic/maincharactor.png" alt="" className="w-[20vw] h-auto" />
          </div>

          {/* Textbox (กลาง) */}
          <div className="flex justify-center items-center">
            <Textbox
              word={enemyWord}
              typedIndexes={typedIndexes}
              language={language}
            />
          </div>

          {/* Enemy */}
          <div
            className={`enemy-box ${enemyShake ? "enemy-shake" : "enemy-float"}`}
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
      </>
      )}
      

      {showResult && (
        <ResultPopup
          isWin={isWin}
          wpm={wpm}
          accuracy={accuracy}
          score={score}
          difficulty={difficulty}
          onClose={() => setShowResult(false)}
          onRestart={() => window.location.reload()}
        />
      )}

      
      
    </div>
  );
}
