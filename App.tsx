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
  // Character Identity State
  const [artStyle, setArtStyle] = useState<ArtStyle>(ArtStyle.PHOTOREALISTIC);
  const [characterRef, setCharacterRef] = useState<{ base64: string, mimeType: string }[]>([]);
  const characterFileInputRef = useRef<HTMLInputElement>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');

  const defaultActing: ActingSettings = {
    internalEmotion: EmotionType.NEUTRAL,
    internalIntensity: 5,
    externalExpression: ExpressionType.MATCH_INTERNAL,
    externalIntensity: 5
  };
  
  const defaultBackground: BackgroundSettings = {
    mode: BackgroundMode.TEXT,
    prompt: '',
  };

  const [startFrame, setStartFrame] = useState<FrameSettings>({
    scenePrompt: 'Bright studio lighting',
    shotSize: ShotSize.MEDIUM_CLOSE_UP,
    cameraLevel: CameraLevel.EYE_LEVEL,
    shotDirection: ShotDirection.FRONT_VIEW,
    acting: { ...defaultActing },
    background: { ...defaultBackground },
    generatedImage: null
  });

  const [endFrame, setEndFrame] = useState<FrameSettings>({
    scenePrompt: 'Bright studio lighting',
    shotSize: ShotSize.MEDIUM_CLOSE_UP,
    cameraLevel: CameraLevel.EYE_LEVEL,
    shotDirection: ShotDirection.FRONT_VIEW,
    acting: { ...defaultActing },
    background: { ...defaultBackground },
    generatedImage: null
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

  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       const reader = new FileReader();
       reader.onload = (evt) => {
         const result = evt.target?.result as string;
         const base64 = result.split(',')[1];
         const mimeType = result.split(';')[0].split(':')[1];
         // Append to array, max 4
         if (characterRef.length < 4) {
             setCharacterRef(prev => [...prev, { base64, mimeType }]);
         }
       };
       reader.readAsDataURL(file);
    }
  };

  const removeCharacterRef = (index: number) => {
    setCharacterRef(prev => prev.filter((_, i) => i !== index));
  };

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        // API Key Check via global aistudio object
        const aistudio = (window as any).aistudio;
        if (aistudio) {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await aistudio.openSelectKey();
            }
        }

        const currentFrame = activeTab === 'start' ? startFrame : endFrame;
        
        // Prepare Params
        const params = {
            prompt: `Art Style: ${artStyle}. ${currentFrame.scenePrompt}`, // Include art style in prompt
            shotSize: currentFrame.shotSize,
            cameraLevel: currentFrame.cameraLevel,
            shotDirection: currentFrame.shotDirection,
            referenceImages: characterRef,
            acting: currentFrame.acting,
            background: currentFrame.background,
            startFrameReference: activeTab === 'end' && startFrame.generatedImage ? {
                base64: startFrame.generatedImage.split(',')[1],
                mimeType: startFrame.generatedImage.split(';')[0].split(':')[1]
            } : undefined
        };

        const result = await generateImageWithNanoBanana(params);
        if (result.error) {
            setError(result.error);
        } else if (result.imageUrl) {
            updateActiveSettings({ generatedImage: result.imageUrl });
        }
    } catch (e: any) {
        setError(e.message || "Unknown error");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-6">
            
            {/* Global Settings: Character & Style */}
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">캐릭터 레퍼런스 (최대 4장)</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {characterRef.map((ref, idx) => (
                            <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-zinc-700 group">
                                <img src={`data:${ref.mimeType};base64,${ref.base64}`} className="w-full h-full object-cover" alt="ref" />
                                <button onClick={() => removeCharacterRef(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 font-bold">X</button>
                            </div>
                        ))}
                        {characterRef.length < 4 && (
                            <button 
                                onClick={() => characterFileInputRef.current?.click()}
                                className="w-16 h-16 shrink-0 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-indigo-500 hover:border-indigo-500 transition-colors"
                            >
                                <UploadIcon />
                            </button>
                        )}
                        <input type="file" ref={characterFileInputRef} onChange={handleCharacterUpload} className="hidden" accept="image/*" />
                    </div>
                </div>
            </div>

            {/* Frame Tabs */}
            <div className="flex border-b border-zinc-800">
                <button 
                    onClick={() => setActiveTab('start')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'start' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <PlayIcon /> Start Frame
                </button>
                <button 
                    onClick={() => setActiveTab('end')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'end' ? 'border-pink-500 text-pink-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <FlagIcon /> End Frame
                </button>
            </div>

            {/* Frame Specific Controls */}
            <div className="space-y-6">
                
                <div className="space-y-4">
                    <label className="text-sm font-medium text-zinc-400">장면 묘사 (Prompt)</label>
                    <textarea 
                        className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Ex: A futuristic city street at night, neon lights..."
                        value={activeSettings.scenePrompt}
                        onChange={(e) => updateActiveSettings({ scenePrompt: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ControlSelect 
                        label="Shot Size"
                        value={activeSettings.shotSize}
                        onChange={(v) => updateActiveSettings({ shotSize: v as ShotSize })}
                        options={ShotSize}
                        icon={<CameraIcon />}
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
                        onChange={(v) => updateActiveSettings({ shotDirection: v as ShotDirection })}
                        options={ShotDirection}
                    />
                </div>

                <ActingControls 
                    settings={activeSettings.acting}
                    onChange={(acting) => updateActiveSettings({ acting })}
                />

                <BackgroundControls 
                    settings={activeSettings.background}
                    onChange={(background) => updateActiveSettings({ background })}
                />
            </div>
            
            <button
                onClick={generate}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isGenerating 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
                }`}
            >
                {isGenerating ? (
                    <>Generating...</>
                ) : (
                    <>
                        <SparklesIcon /> 
                        {activeTab === 'start' ? 'Generate Start Frame' : 'Generate End Frame'}
                    </>
                )}
            </button>
            
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="sticky top-24 space-y-6">
                 <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative group">
                    {activeSettings.generatedImage ? (
                        <img 
                            src={activeSettings.generatedImage} 
                            alt="Generated" 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 gap-4">
                            <SparklesIcon />
                            <span className="text-lg font-medium">Ready to Generate</span>
                        </div>
                    )}
                    
                    {/* Overlay info */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-mono text-white border border-white/10">
                        {activeTab.toUpperCase()} FRAME
                    </div>
                 </div>

                 {/* Sequence Preview (Mini timeline) */}
                 <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Sequence Preview</h3>
                    <div className="flex gap-4">
                        <div 
                            onClick={() => setActiveTab('start')}
                            className={`flex-1 aspect-video rounded-lg border-2 overflow-hidden cursor-pointer relative ${activeTab === 'start' ? 'border-indigo-500' : 'border-zinc-800 hover:border-zinc-700'}`}
                        >
                            {startFrame.generatedImage ? (
                                <img src={startFrame.generatedImage} className="w-full h-full object-cover" alt="Start" />
                            ) : (
                                <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 text-xs">Start Frame</div>
                            )}
                        </div>
                        <div className="flex items-center text-zinc-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                        <div 
                            onClick={() => setActiveTab('end')}
                            className={`flex-1 aspect-video rounded-lg border-2 overflow-hidden cursor-pointer relative ${activeTab === 'end' ? 'border-pink-500' : 'border-zinc-800 hover:border-zinc-700'}`}
                        >
                             {endFrame.generatedImage ? (
                                <img src={endFrame.generatedImage} className="w-full h-full object-cover" alt="End" />
                            ) : (
                                <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 text-xs">End Frame</div>
                            )}
                            {/* Overlay if start frame exists but end doesn't */}
                            {!endFrame.generatedImage && startFrame.generatedImage && (
                                <div className="absolute inset-0 bg-indigo-900/10 flex items-center justify-center">
                                    <span className="text-[10px] text-indigo-300 bg-indigo-950/80 px-2 py-1 rounded">Uses Start Frame as Context</span>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;