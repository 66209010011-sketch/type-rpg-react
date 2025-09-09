import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, loginWithGoogle, logout, db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export default function StartScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const openWordManager = () => {
    window.open("/word-manager", "_blank");
  };

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

  // 🔹 ฟังก์ชันแก้ชื่อ
  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { displayName: newName });
    setUser({ ...user, displayName: newName });
    setEditing(false);
    setNewName("");
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[url(/pic/scene/startscreen.gif)] bg-no-repeat bg-cover text-white">
      {/* 🔹 ปุ่ม Login/Logout มุมขวาบน */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {user ? (
          <>
            {editing ? (
              <div className="flex flex-col items-end gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ใส่ชื่อใหม่..."
                  className="px-2 py-1 text-black rounded-lg bg-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateName}
                    className="px-3 py-1 bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    ✅ บันทึก
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 bg-gray-500 rounded-lg hover:bg-gray-600"
                  >
                    ❌ ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">สวัสดี, {user.displayName}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 bg-yellow-500 rounded-lg hover:bg-yellow-600"
                  >
                    ✏️ แก้ชื่อ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="px-3 py-1 bg-blue-500 rounded-lg transform transition-transform hover:bg-blue-600 text-xl"
          >
            Log in with Google
          </button>
        )}
        <div className="flex gap-2">
            <button
              onClick={openWordManager}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              ระบบการจัดการ
            </button>
        </div>
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
            className="w-[5vw] h-auto object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer mr-5"
            onClick={() => navigate("/leaderboard")}
          />
          <img
            src="/pic/book.png"
            alt="book"
            className="w-[5vw] h-auto object-contain transform transition-transform duration-300 hover:scale-110 cursor-pointer"
            onClick={() => window.open("/manual.pdf", "_blank")}
          />
        </div>
      </div>
    </div>
  );
}
