import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            I
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            IMG4V
          </h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono hidden sm:block">
            Powered by Gemini 2.5 Flash Image
        </div>
      </div>
    </header>
  );
};