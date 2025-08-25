import React, { useEffect, useRef } from 'react';

export default function TypingBox({ onTyping, inputValue }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeydown = (e) => {
      // ป้องกันการลบ (Backspace หรือ Delete)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
      }

      // บังคับ focus ที่ input เสมอ
      if (inputRef.current !== document.activeElement) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // อนุญาตให้พิมพ์ต่อได้ แต่ไม่ให้ลบ
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length >= inputValue.length) {
      onTyping(newValue);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="พิมพ์คำที่เห็น"
        onChange={handleChange}
        value={inputValue}
        className="opacity-0 absolute -left-[9999px]"
      />
    </div>
  );
}
