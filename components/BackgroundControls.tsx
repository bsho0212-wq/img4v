import React, { useRef } from 'react';
import { BackgroundSettings, BackgroundMode } from '../types';
import { ControlSelect } from './ControlSelect';

interface BackgroundControlsProps {
    settings: BackgroundSettings;
    onChange: (settings: BackgroundSettings) => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({ settings, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                const mimeType = result.split(':')[1].split(';')[0];
                onChange({
                    ...settings,
                    image: { base64: base64Data, mimeType: mimeType }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateMode = (mode: string) => {
        onChange({ ...settings, mode: mode as BackgroundMode });
    };

    const clearImage = () => {
        onChange({ ...settings, image: undefined });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21"/></svg>
                공간 및 배경 (Space & Background)
            </h2>

            <ControlSelect 
                label="공간 설정 모드"
                value={settings.mode}
                onChange={updateMode}
                options={BackgroundMode}
            />

            {settings.mode !== BackgroundMode.TEXT && (
                <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-zinc-400">배경 이미지 업로드</label>
                     {!settings.image ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-800/50 transition-all h-24"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <span className="text-xs text-zinc-500">
                                {settings.mode === BackgroundMode.IMAGE_COMPOSITE 
                                    ? "합성할 배경 이미지 선택 (이 이미지 안에 인물을 배치)" 
                                    : "참고할 배경 이미지 선택 (이 이미지의 스타일을 참조)"}
                            </span>
                        </div>
                     ) : (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 group">
                            <img src={`data:${settings.image.mimeType};base64,${settings.image.base64}`} alt="Background Ref" className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-mono text-zinc-300 bg-black/50 px-2 py-1 rounded">
                                    {settings.mode === BackgroundMode.IMAGE_COMPOSITE ? "COMPOSITE TARGET" : "STYLE REFERENCE"}
                                </span>
                            </div>
                            <button 
                                onClick={clearImage}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                     )}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">배경 설명 (필수)</label>
                <textarea 
                    value={settings.prompt}
                    onChange={(e) => onChange({...settings, prompt: e.target.value})}
                    placeholder={settings.mode === BackgroundMode.IMAGE_COMPOSITE ? "이 배경의 어떤 위치에 인물을 배치할지 설명하세요." : "어떤 공간인지 텍스트로 묘사해주세요."}
                    className="w-full h-20 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
            </div>
        </div>
    );
};