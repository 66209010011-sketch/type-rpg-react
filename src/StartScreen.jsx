import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, loginWithGoogle, logout, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function StartScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) saveUserToFirestore(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        progress: {
          stage1: { highScore: 0, wpm: 0 },
          stage2: { highScore: 0, wpm: 0 },
          stage3: { highScore: 0, wpm: 0 },
          stage4: { highScore: 0, wpm: 0 },
          stage5: { highScore: 0, wpm: 0 },
        },
      });
    } else {
      await setDoc(
        userRef,
        { lastLogin: new Date().toISOString() },
        { merge: true }
      );
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover text-white">
      {/* 🔹 ปุ่ม Login/Logout มุมขวาบน */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {user ? (
          <>
            <p className="text-sm">สวัสดี, {user.displayName}</p>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-600 text-xl"
            >
              ออกจากระบบ Log Out
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="px-3 py-1 bg-blue-500 rounded-lg transform transition-transform hover:bg-blue-600 text-xl"
          >
            Log in with Google
          </button>
        )}
      </div>

      {/* โลโก้ */}
      <img
        src="/pic/logo/logotypingadventure.png"
        alt="Logo"
        className="w-[50vw] mb-10"
      />

      {/* ปุ่ม Play */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center items-center">
          <img
            src="/pic/playbutton.png"
            alt="Play Button"
            className="w-[15vw] h-auto object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer"
            onClick={() => navigate("/stage-select")}
          />
        </div>

        <div className="flex justify-center items-center">
          <img
            src="/pic/trophy.png"
            alt="Trophy"
            className="w-[5vw] h-auto object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer"
            onClick={() => navigate("/leaderboard")}
          />
        </div>
      </div>

    </div>
  );
}
