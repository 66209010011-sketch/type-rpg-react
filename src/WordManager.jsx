import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

export default function WordManager() {
  const [tab, setTab] = useState("words");

  const [words, setWords] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [users, setUsers] = useState([]);

  // filter
  const [wordFilter, setWordFilter] = useState("");
  const [enemyFilter, setEnemyFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // form state
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newLanguage, setNewLanguage] = useState("TH");
  const [newDifficulty, setNewDifficulty] = useState(1);

  const [newEnemy, setNewEnemy] = useState({
    name: "",
    image: "",
    health: 100,
    difficulty: 1,
  });

  const [newUser, setNewUser] = useState({
    displayName: "",
    email: "",
  });

  // editing state
  const [editingWord, setEditingWord] = useState(null);
  const [editingEnemy, setEditingEnemy] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [showScrollTop, setShowScrollTop] = useState(false);

  const editRef = useRef(null);
  const topRef = useRef(null);

 const scrollContainerRef = useRef(null);

useEffect(() => {
  const handleScroll = () => {
      if (scrollContainerRef.current.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    const el = scrollContainerRef.current;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const importWordsFromJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return alert("ไฟล์ JSON ต้องเป็น Array");

      for (let item of data) {
        if (item.word) {
          await addDoc(collection(db, "words"), {
            word: item.word,
            meaning: item.meaning,
            language: item.language || "TH",
            difficulty: Number(item.difficulty) || 1,
          });
        }
      }
      alert("นำเข้าไฟล์ JSON สำเร็จ");
    } catch (err) {
      alert("ไฟล์ JSON ไม่ถูกต้อง");
    }
  };

  // subscribe realtime
  useEffect(() => {
    const unsubWords = onSnapshot(collection(db, "words"), (snap) =>
      setWords(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubEnemies = onSnapshot(collection(db, "enemies"), (snap) =>
      setEnemies(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) =>
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubWords();
      unsubEnemies();
      unsubUsers();
    };
  }, []);

  // add
  const addWord = async () => {
    if (!newWord || !newMeaning) return alert("กรอกข้อมูลให้ครบ");
    await addDoc(collection(db, "words"), {
      word: newWord,
      meaning: newMeaning,
      language: newLanguage,
      difficulty: Number(newDifficulty),
    });
    setNewWord("");
    setNewMeaning("");
    setNewLanguage("TH");
    setNewDifficulty(1);
  };

  const addEnemy = async () => {
    if (!newEnemy.name) return alert("กรุณากรอกชื่อศัตรู");
    await addDoc(collection(db, "enemies"), {
      ...newEnemy,
      health: Number(newEnemy.health),
      difficulty: Number(newEnemy.difficulty),
    });
    setNewEnemy({ name: "", image: "", health: 100, difficulty: 1 });
  };

  const addUser = async () => {
    if (!newUser.displayName || !newUser.email)
      return alert("กรอกข้อมูลผู้ใช้ให้ครบ");
    await addDoc(collection(db, "users"), {
      displayName: newUser.displayName,
      email: newUser.email,
      progress: {},
    });
    setNewUser({ displayName: "", email: "" });
  };

  // delete
  const deleteWord = async (id) => await deleteDoc(doc(db, "words", id));
  const deleteEnemy = async (id) => await deleteDoc(doc(db, "enemies", id));
  const deleteUser = async (id) => await deleteDoc(doc(db, "users", id));

  // update
  const updateWord = async () => {
    await updateDoc(doc(db, "words", editingWord.id), {
      word: editingWord.word,
      meaning: editingWord.meaning,
      language: editingWord.language,
      difficulty: Number(editingWord.difficulty),
    });
    setEditingWord(null);
  };

  const updateEnemy = async () => {
    await updateDoc(doc(db, "enemies", editingEnemy.id), {
      name: editingEnemy.name,
      image: editingEnemy.image,
      health: Number(editingEnemy.health),
      difficulty: Number(editingEnemy.difficulty),
    });
    setEditingEnemy(null);
  };

  const updateUser = async () => {
    await updateDoc(doc(db, "users", editingUser.id), {
      displayName: editingUser.displayName,
      email: editingUser.email,
    });
    setEditingUser(null);
  };

  // scroll to edit
  const handleEdit = (setEditing, data) => {
    setEditing(data);
    setTimeout(() => {
      editRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <div ref={scrollContainerRef} className="p-6 bg-white h-screen overflow-auto">
      <h1 className="text-xl font-bold mb-4">ระบบการจัดการ Typing Adventure (Admin Manager)</h1>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center 
                     bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-800 transition"
        >
          ⬆
        </button>
      )}
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab("words")}
          className={`px-4 py-2 rounded ${
            tab === "words" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📖 Words
        </button>
        <button
          onClick={() => setTab("enemies")}
          className={`px-4 py-2 rounded ${
            tab === "enemies" ? "bg-purple-600 text-white" : "bg-gray-200"
          }`}
        >
          👾 Enemies
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded ${
            tab === "users" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          👤 Users
        </button>
      </div>

      {/* === Words === */}
      {tab === "words" && (
        <div>
          {/* ✅ Added: แสดงจำนวนคำทั้งหมด */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">
              🧮 จำนวนคำทั้งหมด:{" "}
              <span className="text-blue-600 font-bold">{words.length}</span> คำ
            </h2>
          </div>

          <input
            type="text"
            placeholder="ค้นหา Word..."
            value={wordFilter}
            onChange={(e) => setWordFilter(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          {/* Add */}
          <div className="mb-4 p-4 border rounded bg-gray-100">
            <h3 className="font-bold mb-2">➕ เพิ่ม Word</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Meaning"
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
            />
            <select
              className="border p-2 w-full mb-2"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
            >
              <option value="TH">ไทย</option>
              <option value="EN">อังกฤษ</option>
            </select>
            <input
              className="border p-2 w-full mb-2"
              type="number"
              value={newDifficulty}
              onChange={(e) => setNewDifficulty(e.target.value)}
            />
            <button
              onClick={addWord}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-5"
            >
              บันทึก
            </button>
            <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                📂Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={importWordsFromJSON}
                  className="hidden"
                />
            </label>
          </div>
          
          {/* Table */}
          <table className="border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2">Word</th>
                <th className="border px-2">Meaning</th>
                <th className="border px-2">Lang</th>
                <th className="border px-2">Diff</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {words
                .filter((w) =>
                  w.word.toLowerCase().includes(wordFilter.toLowerCase())
                )
                .map((w) => (
                  <tr key={w.id}>
                    <td className="border px-2">{w.word}</td>
                    <td className="border px-2">{w.meaning}</td>
                    <td className="border px-2">{w.language}</td>
                    <td className="border px-2">{w.difficulty}</td>
                    <td className="border px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(setEditingWord, w)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => deleteWord(w.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {editingWord && (
            <div ref={editRef} className="mt-4 p-4 border rounded bg-gray-100">
              <h3 className="font-bold mb-2">✏️ แก้ไข Word</h3>
              <input
                className="border p-2 w-full mb-2"
                value={editingWord.word}
                onChange={(e) =>
                  setEditingWord({ ...editingWord, word: e.target.value })
                }
              />
              <input
                className="border p-2 w-full mb-2"
                value={editingWord.meaning}
                onChange={(e) =>
                  setEditingWord({ ...editingWord, meaning: e.target.value })
                }
              />
              <button
                onClick={updateWord}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                บันทึก
              </button>
              <button
                onClick={() => setEditingWord(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      )}

      {/* === Enemies === */}
      {tab === "enemies" && (
        <div>
          <input
            type="text"
            placeholder="ค้นหา Enemy..."
            value={enemyFilter}
            onChange={(e) => setEnemyFilter(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          {/* Add */}
          <div className="mb-4 p-4 border rounded bg-gray-100">
            <h3 className="font-bold mb-2">➕ เพิ่ม Enemy</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Name"
              value={newEnemy.name}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, name: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Image URL"
              value={newEnemy.image}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, image: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              type="number"
              placeholder="Health"
              value={newEnemy.health}
              onChange={(e) =>
                setNewEnemy({ ...newEnemy, health: e.target.value })
              }
            />
            <button
              onClick={addEnemy}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              บันทึก
            </button>
          </div>
          {/* Table */}
          <table className="border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2">Name</th>
                <th className="border px-2">Image</th>
                <th className="border px-2">Health</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enemies
                .filter((e) =>
                  e.name.toLowerCase().includes(enemyFilter.toLowerCase())
                )
                .map((e) => (
                  <tr key={e.id}>
                    <td className="border px-2">{e.name}</td>
                    <td className="border px-2">
                      <img
                        src={e.image}
                        alt={e.name}
                        className="w-12 h-12 object-contain"
                      />
                    </td>
                    <td className="border px-2">{e.health}</td>
                    <td className="border px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(setEditingEnemy, e)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => deleteEnemy(e.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {editingEnemy && (
            <div ref={editRef} className="mt-4 p-4 border rounded bg-gray-100">
              <h3 className="font-bold mb-2">✏️ แก้ไข Enemy</h3>
              <input
                className="border p-2 w-full mb-2"
                value={editingEnemy.name}
                onChange={(e) =>
                  setEditingEnemy({ ...editingEnemy, name: e.target.value })
                }
              />
              <input
                className="border p-2 w-full mb-2"
                value={editingEnemy.image}
                onChange={(e) =>
                  setEditingEnemy({ ...editingEnemy, image: e.target.value })
                }
              />
              <input
                className="border p-2 w-full mb-2"
                type="number"
                value={editingEnemy.health}
                onChange={(e) =>
                  setEditingEnemy({ ...editingEnemy, health: e.target.value })
                }
              />
              <button
                onClick={updateEnemy}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                บันทึก
              </button>
              <button
                onClick={() => setEditingEnemy(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      )}

      {/* === Users === */}
      {tab === "users" && (
        <div>
          <input
            type="text"
            placeholder="ค้นหา User..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          {/* Add */}
          <div className="mb-4 p-4 border rounded bg-gray-100">
            <h3 className="font-bold mb-2">➕ เพิ่ม User</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Name"
              value={newUser.displayName}
              onChange={(e) =>
                setNewUser({ ...newUser, displayName: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <button
              onClick={addUser}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              บันทึก
            </button>
          </div>
          {/* Table */}
          <table className="border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2">Name</th>
                <th className="border px-2">Email</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(
                  (u) =>
                    (u.displayName || "")
                      .toLowerCase()
                      .includes(userFilter.toLowerCase()) ||
                    (u.email || "")
                      .toLowerCase()
                      .includes(userFilter.toLowerCase())
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td className="border px-2">{u.displayName}</td>
                    <td className="border px-2">{u.email}</td>
                    <td className="border px-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(setEditingUser, u)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {editingUser && (
            <div ref={editRef} className="mt-4 p-4 border rounded bg-gray-100">
              <h3 className="font-bold mb-2">✏️ แก้ไข User</h3>
              <input
                className="border p-2 w-full mb-2"
                value={editingUser.displayName}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    displayName: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 w-full mb-2"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
              <button
                onClick={updateUser}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                บันทึก
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
    
  );
}
