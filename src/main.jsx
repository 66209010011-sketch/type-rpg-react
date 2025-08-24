import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "./pages/StartScreen";
import StageSelect from "./pages/StageSelect";
import Options from "./pages/Options";
import App from "./App";
import WordManager from "./WordManager";
import "./output.css"; // หรือ "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/stage-select" element={<StageSelect />} />
      <Route path="/options" element={<Options />} />
      <Route path="/game" element={<App />} />
      <Route path="/word-manager" element={<WordManager />} />
    </Routes>
  </BrowserRouter>
);