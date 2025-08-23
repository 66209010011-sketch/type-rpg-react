import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export default function WordManager() {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [language, setLanguage] = useState("TH");
  const [difficulty, setDifficulty] = useState(1);

  // โหลดข้อมูลจาก Firestore
  const loadWords = async () => {
    const snapshot = await getDocs(collection(db, "words"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWords(data);
  };

  useEffect(() => {
    loadWords();
  }, []);

  // เพิ่มคำใหม่ (กันซ้ำด้วย)
  const addWord = async () => {
    if (!newWord.trim() || !meaning.trim())
      return alert("กรุณากรอกข้อมูลให้ครบ");

    // เช็คซ้ำ
    const q = query(
      collection(db, "words"),
      where("word", "==", newWord),
      where("language", "==", language)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("❌ คำนี้มีอยู่แล้วในฐานข้อมูล");
      return;
    }

    await addDoc(collection(db, "words"), {
      word: newWord,
      meaning,
      language,
      difficulty: Number(difficulty),
    });

    setNewWord("");
    setMeaning("");
    setDifficulty(1);
    await loadWords();
  };

  // ลบคำเดียว
  const deleteWord = async (id) => {
    await deleteDoc(doc(db, "words", id));
    await loadWords();
  };

  // ลบทุกคำศัพท์
  const clearAllWords = async () => {
    if (!window.confirm("⚠️ ต้องการลบทุกคำศัพท์ในฐานข้อมูลหรือไม่?")) return;

    const snapshot = await getDocs(collection(db, "words"));
    const batchDelete = snapshot.docs.map((d) =>
      deleteDoc(doc(db, "words", d.id))
    );

    await Promise.all(batchDelete);
    alert("✅ ลบคำศัพท์ทั้งหมดเรียบร้อยแล้ว");
    await loadWords();
  };

  // Import JSON
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonWords = JSON.parse(text);
      let added = 0,
        skipped = 0;

      for (const word of jsonWords) {
        const q = query(
          collection(db, "words"),
          where("word", "==", word.word),
          where("language", "==", word.language)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          await addDoc(collection(db, "words"), word);
          added++;
        } else {
          skipped++;
        }
      }

      alert(`✅ Import เสร็จแล้ว (เพิ่มใหม่: ${added} | ข้ามซ้ำ: ${skipped})`);
      await loadWords();
    } catch (err) {
      console.error("Import error:", err);
      alert("❌ เกิดข้อผิดพลาดตอน import");
    }
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">Word Manager</h1>

      {/* ฟอร์มเพิ่มคำใหม่ + ปุ่ม import/clear */}
      <div className="mb-6 space-y-2 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Word"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          className="border px-3 py-1"
        />
        <input
          type="text"
          placeholder="Meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="border px-3 py-1"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-3 py-1"
        >
          <option value="TH">ไทย</option>
          <option value="EN">English</option>
        </select>
        <input
          type="number"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border px-3 py-1 w-20"
          min="1"
          max="5"
        />
        <button
          onClick={addWord}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          เพิ่มคำ
        </button>

        {/* ปุ่ม Import JSON */}
        <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
          📂 Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </label>

        {/* ปุ่ม Clear All */}
        <button
          onClick={clearAllWords}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          🗑️ เคลียร์ทุกคำศัพท์
        </button>
      </div>

      {/* ตารางแสดงคำทั้งหมด */}
      <table className="border-collapse border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Word</th>
            <th className="border px-3 py-2">Meaning</th>
            <th className="border px-3 py-2">Language</th>
            <th className="border px-3 py-2">Difficulty</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {words.map((w) => (
            <tr key={w.id}>
              <td className="border px-3 py-2">{w.word}</td>
              <td className="border px-3 py-2">{w.meaning}</td>
              <td className="border px-3 py-2">{w.language}</td>
              <td className="border px-3 py-2">{w.difficulty}</td>
              <td className="border px-3 py-2">
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
    </div>
  );
}
