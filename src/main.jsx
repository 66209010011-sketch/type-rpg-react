import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import WordManager from "./WordManager";
import "./output.css"; // หรือ "./index.css"

// Debug component
function DebugApp() {
  return (
    <div className="p-4 bg-red-100">
      <h1 className="text-2xl font-bold">Debug Mode</h1>
      <p>If you can see this, React and Tailwind are working!</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/word-manager" element={<WordManager />} />
      <Route path="/debug" element={<DebugApp />} />
    </Routes>
  </BrowserRouter>
);