import { ChangeEvent } from 'react';

interface TerminalInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'url';
  placeholder?: string;
  required?: boolean;
}

export const TerminalInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false
}: TerminalInputProps) => {
  return (
    <div className="mb-4">
      <label className="block font-mono text-sm text-green-500 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 focus:outline-none focus:border-green-500 placeholder-gray-600"
      />
    </div>
  );
};
