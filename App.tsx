// App.tsx — Refactored Version

import React, { useState, useRef, useEffect } from "react";
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

/* ---------------------------------------------
   🔑 API KEY 입력 UI
----------------------------------------------*/
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
    <div className="bg-[#111] p-5 mb-5 rounded-xl">
      <h2 className="text-white mb-2">🔑 Gemini API Key 입력</h2>
      <div className="flex items-center gap-2">
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="여기에 본인 API Key 입력"
          className="w-80 p-2 bg-black/30 border border-zinc-700 rounded"
        />
        <button
          onClick={saveApiKey}
          className="px-4 py-2 bg-indigo-600 rounded text-white"
        >
          저장
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   SVG ICONS
----------------------------------------------*/
const Icon = {
  Camera: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Palette: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2a10 10 0 100 20c.9 0 1.65-.75 1.65-1.69 0-.43-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 011.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C22 6 17.5 2 12 2z" />
    </svg>
  ),
  Play: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Flag: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
};

/* ---------------------------------------------
   MAIN APP
----------------------------------------------*/
const App: React.FC = () => {
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [characterRef, setCharacterRef] = useState<{ base64: string; mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"start" | "end">("start");

  const defaultActing: ActingSettings = {
    internalEmotion: EmotionType.NEUTRAL,
    internalIntensity: 5,
    externalExpression: ExpressionType.MATCH_INTERNAL,
    externalIntensity: 5,
  };

  const defaultBackground: BackgroundSettings = {
    mode: BackgroundMode.TEXT,
    prompt: "",
  };

  const createFrame = (): FrameSettings => ({
    scenePrompt: "Bright studio lighting",
    shotSize: ShotSize.MEDIUM_CLOSE_UP,
    cameraLevel: CameraLevel.EYE_LEVEL,
    shotDirection: ShotDirection.FRONT_VIEW,
    acting: { ...defaultActing },
    background: { ...defaultBackground },
    generatedImage: null,
  });

  const [startFrame, setStartFrame] = useState<FrameSettings>(createFrame());
  const [endFrame, setEndFrame] = useState<FrameSettings>(createFrame());

  const activeSettings = activeTab === "start" ? startFrame : endFrame;
  const updateActiveSettings = (updated: Partial<FrameSettings>) => {
    (activeTab === "start" ? setStartFrame : setEndFrame)((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  /* ---------------------------------------------
     Character Upload
  ----------------------------------------------*/
  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || characterRef.length >= 4) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result as string;
      const base64 = data.split(",")[1];
      const mimeType = data.split(";")[0].split(":")[1];
      setCharacterRef((prev) => [...prev, { base64, mimeType }]);
    };
    reader.readAsDataURL(file);
  };

  const removeCharacterRef = (i: number) =>
    setCharacterRef((prev) => prev.filter((_, idx) => idx !== i));

  /* ---------------------------------------------
     Generate
  ----------------------------------------------*/
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const current = activeSettings;

      const params = {
        prompt: `Art Style: ${artStyle}. ${current.scenePrompt}`,
        shotSize: current.shotSize,
        cameraLevel: current.cameraLevel,
        shotDirection: current.shotDirection,
        referenceImages: characterRef,
        acting: current.acting,
        background: current.background,
        startFrameReference:
          activeTab === "end" && startFrame.generatedImage
            ? {
                base64: startFrame.generatedImage.split(",")[1],
                mimeType: startFrame.generatedImage.split(";")[0].split(":")[1],
              }
            : undefined,
      };

      const result = await generateImageWithNanoBanana(params);
      if (result.error) setError(result.error);
      else updateActiveSettings({ generatedImage: result.imageUrl || null });
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    }

    setIsGenerating(false);
  };

  /* ---------------------------------------------
     RENDER
  ----------------------------------------------*/
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ApiKeyInput />
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-5 space-y-6">
          {/* GLOBAL */}
          <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Icon.User /> 캐릭터 & 스타일 (Global)
            </h2>

            <ControlSelect
              label="아트 스타일"
              value={artStyle}
              onChange={(v) => setArtStyle(v as ArtStyle)}
              options={ArtStyle}
              icon={<Icon.Palette />}
            />

            {/* Character Images */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                캐릭터 레퍼런스 (최대 4장)
              </label>
              <div className="flex gap-2 overflow-x-auto">
                {characterRef.map((ref, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group"
                  >
                    <img
                      src={`data:${ref.mimeType};base64,${ref.base64}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeCharacterRef(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 font-bold"
                    >
                      X
                    </button>
                  </div>
                ))}

                {characterRef.length < 4 && (
                  <button
                    className="w-16 h-16 border-dashed border border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon.Upload />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCharacterUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("start")}
              className={`flex-1 py-3 text-sm ${
                activeTab === "start"
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-zinc-500"
              }`}
            >
              <Icon.Play /> Start
            </button>
            <button
              onClick={() => setActiveTab("end")}
              className={`flex-1 py-3 text-sm ${
                activeTab === "end"
                  ? "border-b-2 border-pink-500 text-pink-400"
                  : "text-zinc-500"
              }`}
            >
              <Icon.Flag /> End
            </button>
          </div>

          {/* Frame Controls */}
          <div className="space-y-6">
            <textarea
              value={activeSettings.scenePrompt}
              onChange={(e) =>
                updateActiveSettings({ scenePrompt: e.target.value })
              }
              className="w-full h-24 bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <ControlSelect
                label="Shot Size"
                value={activeSettings.shotSize}
                onChange={(v) => updateActiveSettings({ shotSize: v as ShotSize })}
                options={ShotSize}
                icon={<Icon.Camera />}
              />
              <ControlSelect
                label="Camera Level"
                value={activeSettings.cameraLevel}
                onChange={(v) => updateActiveSettings({ cameraLevel: v as CameraLevel })}
                options={CameraLevel}
              />
              <ControlSelect
                label="Shot Direction"
                value={activeSettings.shotDirection}
                onChange={(v) =>
                  updateActiveSettings({ shotDirection: v as ShotDirection })
                }
                options={ShotDirection}
              />
            </div>

            <ActingControls
              settings={activeSettings.acting}
              onChange={(v) => updateActiveSettings({ acting: v })}
            />

            <BackgroundControls
              settings={activeSettings.background}
              onChange={(v) => updateActiveSettings({ background: v })}
            />
          </div>

          <button
            onClick={generate}
            disabled={isGenerating}
            className="w-full py-4 bg-indigo-600 rounded-xl text-white font-bold"
          >
            {isGenerating
              ? "Generating..."
              : activeTab === "start"
              ? "Generate Start Frame"
              : "Generate End Frame"}
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — PREVIEW */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-video bg-black border border-zinc-800 rounded-xl overflow-hidden">
            {activeSettings.generatedImage ? (
              <img
                src={activeSettings.generatedImage}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-700">
                Ready
              </div>
            )}
          </div>

          {/* TIMELINE */}
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-sm text-zinc-400 mb-3">Sequence</h3>

            <div className="flex gap-4">
              <div
                className={`flex-1 aspect-video border-2 rounded-lg ${
                  activeTab === "start" ? "border-indigo-500" : ""
                }`}
              >
                {startFrame.generatedImage ? (
                  <img
                    src={startFrame.generatedImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-700 text-xs">
                    Start
                  </div>
                )}
              </div>

              <div className="flex items-center text-zinc-600">→</div>

              <div
                className={`flex-1 aspect-video border-2 rounded-lg ${
                  activeTab === "end" ? "border-pink-500" : ""
                }`}
              >
                {endFrame.generatedImage ? (
                  <img
                    src={endFrame.generatedImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-700 text-xs">
                    End
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
