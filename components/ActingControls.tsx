import React from 'react';
import { ActingSettings, EmotionType, ExpressionType } from '../types';
import { ControlSelect } from './ControlSelect';

interface ActingControlsProps {
  settings: ActingSettings;
  onChange: (settings: ActingSettings) => void;
}

export const ActingControls: React.FC<ActingControlsProps> = ({ settings, onChange }) => {
  
  const updateSetting = <K extends keyof ActingSettings>(key: K, value: ActingSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 2) return '미세함';
    if (val <= 5) return '보통';
    if (val <= 8) return '강함';
    return '극적임';
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800 shadow-sm flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        연기 설정 (Acting & Performance)
      </h2>

      {/* Internal Emotion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <label className="text-sm font-medium text-indigo-400">내면의 감정 (Internal)</label>
           <span className="text-xs text-zinc-500">캐릭터가 속으로 느끼는 감정</span>
        </div>
        
        <ControlSelect
          label=""
          value={settings.internalEmotion}
          onChange={(val) => updateSetting('internalEmotion', val as EmotionType)}
          options={EmotionType}
        />
        
        {/* Custom Input for Internal */}
        {settings.internalEmotion === EmotionType.CUSTOM && (
            <input 
                type="text" 
                placeholder="내면의 감정을 구체적으로 적어주세요 (예: 약간의 질투심)"
                value={settings.customInternalEmotion || ''}
                onChange={(e) => updateSetting('customInternalEmotion', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        )}

        <div className="flex items-center gap-4">
           <span className="text-xs text-zinc-400 w-12">강도</span>
           <input
            type="range"
            min="1"
            max="10"
            value={settings.internalIntensity}
            onChange={(e) => updateSetting('internalIntensity', parseInt(e.target.value))}
            className="flex-grow h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
           />
           <span className="text-xs font-mono text-indigo-300 w-16 text-right">
             {settings.internalIntensity}/10
           </span>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* External Expression */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <label className="text-sm font-medium text-pink-400">외면적 표정 (External)</label>
           <span className="text-xs text-zinc-500">겉으로 보여지는 표정</span>
        </div>
        
        <ControlSelect
          label=""
          value={settings.externalExpression}
          onChange={(val) => updateSetting('externalExpression', val as ExpressionType)}
          options={ExpressionType}
        />

        {/* Custom Input for External */}
        {settings.externalExpression === ExpressionType.CUSTOM && (
            <input 
                type="text" 
                placeholder="보여질 표정을 구체적으로 적어주세요 (예: 씁쓸한 미소)"
                value={settings.customExternalExpression || ''}
                onChange={(e) => updateSetting('customExternalExpression', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
        )}

        <div className="flex items-center gap-4">
           <span className="text-xs text-zinc-400 w-12">강도</span>
           <input
            type="range"
            min="1"
            max="10"
            value={settings.externalIntensity}
            onChange={(e) => updateSetting('externalIntensity', parseInt(e.target.value))}
            className="flex-grow h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
           />
           <span className="text-xs font-mono text-pink-300 w-16 text-right">
             {settings.externalIntensity}/10
           </span>
        </div>
      </div>

      {/* Summary of Performance */}
      <div className="text-xs text-zinc-500 italic bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
        "속마음: <span className="text-indigo-400">{settings.internalEmotion === EmotionType.CUSTOM ? settings.customInternalEmotion : settings.internalEmotion}</span> ({getIntensityLabel(settings.internalIntensity)}), 
        겉표정: <span className="text-pink-400">{settings.externalExpression === ExpressionType.CUSTOM ? settings.customExternalExpression : settings.externalExpression}</span> ({getIntensityLabel(settings.externalIntensity)})"
      </div>

    </div>
  );
};