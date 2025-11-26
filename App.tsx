// 🔑 사용자 API Key 입력 기능
import { useState, useEffect, useRef } from "react";
import React from "react";

import { Header } from "./components/Header";
import { ControlSelect } from "./components/ControlSelect";
import { ActingControls } from "./components/ActingControls";
import { BackgroundControls } from "./components/BackgroundControls";

import {
  ShotSize,
  CameraLevel,
  ShotDirection,
  ArtStyle,
  FrameSettings,
  EmotionType,
  ExpressionType,
  BackgroundMode,
  BackgroundSettings,
  ActingSettings,
} from "./types";

import { generateImageWithNanoBanana } from "./services/geminiService";

// 🔑 사용자 API Key 입력 컴포넌트
function ApiKeyInput() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("GEMINI_API_KEY");
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("GEMINI_API_KEY", apiKey);
    alert("API Key 저장 완료!");
  };

  return (
    <div
      style={{
        background: "#111",
        padding: 20,
        marginBottom: 20,
        borderRadius: 10,
      }}
    >
      <h2 style={{ color: "white", marginBottom: 10 }}>🔑 Gemini API Key 입력</h2>

      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="여기에 본인 API Key 입력"
        style={{ width: "320px", padding: "8px" }}
      />

      <button
        onClick={saveApiKey}
        style={{ marginLeft: 10, padding: "8px 14px", cursor: "pointer" }}
      >
        저장
      </button>
    </div>
  );
}

// Icons
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M7 3v4" />
    <path d="M3 7h4" />
    <path d="M3 5h4" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PaletteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const FlagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const App: React.FC = () => {
  // Character Identity State
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [characterRef, setCharacterRef] = useState<
    { base64: string; mimeType: string }[]
  >([]);

  const characterFileInputRef = useRef<HTMLInputElement>(null);

  // (나머지 기존 App.tsx 내용은 그대로 유지)

  return (
    <div>
      {/* 🔑 사용자가 API Key 입력하는 UI */}
      <ApiKeyInput />

      {/* 기존 UI 전체 */}
      <Header />
      {/* ... 이하 기존 UI와 로직 유지 ... */}
    </div>
  );
};

export default App;
