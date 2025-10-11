import { ChangeEvent } from 'react';

interface TerminalTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TerminalTextarea = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4
}: TerminalTextareaProps) => {
  return (
    <div className="mb-4">
      <label className="block font-mono text-sm text-green-500 mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 focus:outline-none focus:border-green-500 placeholder-gray-600 resize-none"
      />
    </div>
  );
};
