import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "./StartScreen";
import StageSelect from "./StageSelect";
import App from "./App";
import WordManager from "./WordManager";
import "./output.css"; // หรือ "./index.css"
import ResultPopup from "./components/ResultPopup";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/stage-select" element={<StageSelect />} />
      <Route path="/game" element={<App />} />
      <Route path="/Result" element={<ResultPopup />} />
      <Route path="/word-manager" element={<WordManager />} />
    </Routes>
  </BrowserRouter>
);