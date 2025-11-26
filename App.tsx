// 🔑 사용자 API Key 입력 기능
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlSelect } from './components/ControlSelect';
import { ActingControls } from './components/ActingControls';
import { BackgroundControls } from './components/BackgroundControls';

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
  ActingSettings
} from './types';

import { generateImageWithNanoBanana } from './services/geminiService';

// 🔑 API Key 입력 UI 컴포넌트
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
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M7 3v4"/><path d="M3 7h4"/><path d="M3 5h4"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
);
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const FlagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const App: React.FC = () => {
  // Character Identity
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [characterRef, setCharacterRef] = useState<{ base64: string; mimeType: string }[]>([]);
  const characterFileInputRef = useRef<HTMLInputElement>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  // Default Settings
  const defaultActing: ActingSettings = {
    internalEmotion: EmotionType.NEUTRAL,
    internalIntensity: 5,
    externalExpression: ExpressionType.MATCH_INTERNAL,
    externalIntensity: 5,
  };

  const defaultBackground: BackgroundSettings = {
    mode: BackgroundMode.TEXT,
    prompt: '',
  };

  // Frames
  const [startFrame, setStartFrame] = useState<FrameSettings>({
    scenePrompt: 'Bright studio lighting',
    shotSize: ShotSize.MEDIUM_CLOSE_UP,
    cameraLevel: CameraLevel.EYE_LEVEL,
    shotDirection: ShotDirection.FRONT_VIEW,
    acting: { ...defaultActing },
    background: { ...defaultBackground },
    generatedImage: null,
  });

  const [endFrame, setEndFrame] = useState<FrameSettings>({
    scenePrompt: 'Bright studio lighting',
    shotSize: ShotSize.MEDIUM_CLOSE_UP,
    cameraLevel: CameraLevel.EYE_LEVEL,
    shotDirection: ShotDirection.FRONT_VIEW,
    acting: { ...defaultActing },
    background: { ...defaultBackground },
    generatedImage: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers
  const activeSettings = activeTab === 'start' ? startFrame : endFrame;
  const updateActiveSettings = (newSettings: Partial<FrameSettings>) => {
    if (activeTab === 'start') {
      setStartFrame(prev => ({ ...prev, ...newSettings }));
    } else {
      setEndFrame(prev => ({ ...prev, ...newSettings }));
    }
  };

  // Character Upload
  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       const reader = new FileReader();
       reader.onload = (evt) => {
         const result = evt.target?.result as string;
         const base64 = result.split(',')[1];
         const mimeType = result.split(';')[0].split(':')[1];

         if (characterRef.length < 4) {
           setCharacterRef(prev => [...prev, { base64, mimeType }]);
         }
       };
       reader.readAsDataURL(file);
    }
  };

  const removeCharacterRef = (idx: number) =>
    setCharacterRef(prev => prev.filter((_, i) => i !== idx));

  // Generate
  const generate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const currentFrame = activeTab === 'start' ? startFrame : endFrame;

      const params = {
        prompt: `Art Style: ${artStyle}. ${currentFrame.scenePrompt}`,
        shotSize: currentFrame.shotSize,
        cameraLevel: currentFrame.cameraLevel,
        shotDirection: currentFrame.shotDirection,
        referenceImages: characterRef,
        acting: currentFrame.acting,
        background: currentFrame.background,
        startFrameReference:
          activeTab === 'end' && startFrame.generatedImage
            ? {
                base64: startFrame.generatedImage.split(',')[1],
                mimeType: startFrame.generatedImage.split(';')[0].split(':')[1],
              }
            : undefined,
      };

      const result = await generateImageWithNanoBanana(params);

      if (result.error) setError(result.error);
      else if (result.imageUrl) updateActiveSettings({ generatedImage: result.imageUrl });

    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      
      {/* 🔑 API KEY INPUT */}
      <ApiKeyInput />

      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT */}
        <div className="lg:col-span-5 space-y-6">

          {/* Global */}
          <div className="bg-zinc-900/50 p-5 rounded-xl border border-zinc-800 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserIcon /> 캐릭터 & 스타일 (Global)
            </h2>

            <ControlSelect 
              label="아트 스타일"
              value={artStyle}
              onChange={(v) => setArtStyle(v as ArtStyle)}
              options={ArtStyle}
              icon={<PaletteIcon />}
            />

            {/* Character Refs */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">캐릭터 레퍼런스 (최대 4장)</label>
              <div className="flex gap-2 overflow-x-auto">
                {characterRef.map((ref, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
                    <img src={`data:${ref.mimeType};base64,${ref.base64}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeCharacterRef(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 font-bold">X</button>
                  </div>
                ))}
                {characterRef.length < 4 && (
                  <button
                    onClick={() => characterFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500"
                  >
                    <UploadIcon />
                  </button>
                )}
                <input type="file" ref={characterFileInputRef} onChange={handleCharacterUpload} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('start')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'start' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-zinc-500'}`}
            >
              <PlayIcon /> Start
            </button>
            <button
              onClick={() => setActiveTab('end')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'end' ? 'border-b-2 border-pink-500 text-pink-400' : 'text-zinc-500'}`}
            >
              <FlagIcon /> End
            </button>
          </div>

          {/* Frame Controls */}
          <div className="space-y-6">
            <textarea
              value={activeSettings.scenePrompt}
              onChange={(e) => updateActiveSettings({ scenePrompt: e.target.value })}
              className="w-full h-24 bg-zinc-800 border border-zinc-700 p-3 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-4">
              <ControlSelect 
                label="Shot Size" value={activeSettings.shotSize}
                onChange={(v) => updateActiveSettings({ shotSize: v as ShotSize })}
                options={ShotSize} icon={<CameraIcon />}
              />
              <ControlSelect 
                label="Camera Level" value={activeSettings.cameraLevel}
                onChange={(v) => updateActiveSettings({ cameraLevel: v as CameraLevel })}
                options={CameraLevel}
              />
              <ControlSelect 
                label="Shot Direction" value={activeSettings.shotDirection}
                onChange={(v) => updateActiveSettings({ shotDirection: v as ShotDirection })}
                options={ShotDirection}
              />
            </div>

            <ActingControls settings={activeSettings.acting} onChange={(v) => updateActiveSettings({ acting: v })} />

            <BackgroundControls settings={activeSettings.background} onChange={(v) => updateActiveSettings({ background: v })} />
          </div>

          <button
            onClick={generate}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold"
          >
            {isGenerating ? "Generating..." : activeTab === 'start' ? "Generate Start Frame" : "Generate End Frame"}
          </button>

          {error && <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">{error}</div>}

        </div>

        {/* RIGHT: Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-video bg-black rounded-xl border border-zinc-800 overflow-hidden">
            {activeSettings.generatedImage ? (
              <img src={activeSettings.generatedImage} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">Ready</div>
            )}
          </div>

          {/* Mini Timeline */}
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-sm text-zinc-400 mb-3">Sequence</h3>
            <div className="flex gap-4">
              <div className={`flex-1 aspect-video border-2 rounded-lg ${activeTab === 'start' ? 'border-indigo-500' : ''}`}>
                {startFrame.generatedImage ? (
                  <img src={startFrame.generatedImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">Start</div>
                )}
              </div>

              <div className="flex items-center text-zinc-600">
                →
              </div>

              <div className={`flex-1 aspect-video border-2 rounded-lg ${activeTab === 'end' ? 'border-pink-500' : ''}`}>
                {endFrame.generatedImage ? (
                  <img src={endFrame.generatedImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">End</div>
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
