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

  const [enemies, setEnemies] = useState([]);

  // โหลด words
  const loadWords = async () => {
    const snapshot = await getDocs(collection(db, "words"));
    setWords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // โหลด enemies
  const loadEnemies = async () => {
    const snapshot = await getDocs(collection(db, "enemies"));
    setEnemies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    loadWords();
    loadEnemies();
  }, []);

  // เพิ่มคำ
  const addWord = async () => {
    if (!newWord.trim() || !meaning.trim())
      return alert("กรุณากรอกข้อมูลให้ครบ");

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

  // ลบคำ
  const deleteWord = async (id) => {
    await deleteDoc(doc(db, "words", id));
    await loadWords();
  };

  // Import words.json
  const handleImportWords = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonWords = JSON.parse(text);
      let added = 0, skipped = 0;

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
        } else skipped++;
      }

      alert(`✅ Import เสร็จแล้ว (เพิ่มใหม่: ${added} | ข้ามซ้ำ: ${skipped})`);
      await loadWords();
    } catch (err) {
      console.error("Import words error:", err);
    }
  };

  // Import enemy.json
  const handleImportEnemies = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonEnemies = JSON.parse(text);
      let added = 0, skipped = 0;

      for (const enemy of jsonEnemies) {
        const q = query(
          collection(db, "enemies"),
          where("name", "==", enemy.name)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          await addDoc(collection(db, "enemies"), enemy);
          added++;
        } else skipped++;
      }

      alert(`✅ Import Enemy เสร็จแล้ว (เพิ่มใหม่: ${added} | ข้ามซ้ำ: ${skipped})`);
      await loadEnemies();
    } catch (err) {
      console.error("Import enemies error:", err);
    }
  };

  // ลบทุกคำศัพท์
const clearAllWords = async () => {
  if (!window.confirm("⚠️ ต้องการลบทุกคำศัพท์ในฐานข้อมูลหรือไม่?")) return;

  const snapshot = await getDocs(collection(db, "words"));
  const batchDelete = snapshot.docs.map((d) => deleteDoc(doc(db, "words", d.id)));

  await Promise.all(batchDelete);
  alert("✅ ลบคำศัพท์ทั้งหมดเรียบร้อยแล้ว");
  await loadWords();
};
  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">Word & Enemy Manager</h1>

      {/* Import buttons */}
      <div className="flex gap-2 mb-4">
        {/* Words */}
        <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
          📂 Import Words JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImportWords} />
        </label>

        {/* Enemies */}
        <label className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer">
          🐉 Import Enemies JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImportEnemies} />
        </label>
      </div>
      {/* ปุ่ม Clear All */}
      <button
        onClick={clearAllWords}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        🗑️ เคลียร์ทุกคำศัพท์
      </button>


      {/* ตาราง Words */}
      <h2 className="text-lg font-bold mt-6">📖 Words</h2>
      <table className="border-collapse border w-full mb-6">
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

      {/* ตาราง Enemies */}
      <h2 className="text-lg font-bold mt-6">👾 Enemies</h2>
      <table className="border-collapse border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Image</th>
            <th className="border px-3 py-2">Health</th>
            <th className="border px-3 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {enemies.map((e) => (
            <tr key={e.id}>
              <td className="border px-3 py-2">{e.name}</td>
              <td className="border px-3 py-2"><img src={e.image} alt={e.name} className="w-16 h-16 object-contain" /></td>
              <td className="border px-3 py-2">{e.health}</td>
              <td className="border px-3 py-2">{e.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
