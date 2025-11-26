import React from 'react';

interface ControlSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  icon?: React.ReactNode;
}

export const ControlSelect: React.FC<ControlSelectProps> = ({ label, value, onChange, options, icon }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-zinc-750 text-sm"
        >
          {Object.entries(options).map(([key, val]) => (
            <option key={key} value={val}>
              {val}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};