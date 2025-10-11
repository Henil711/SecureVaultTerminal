import { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { calculatePasswordStrength, generatePassword } from '../utils/password';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  showGenerator?: boolean;
  required?: boolean;
}

export const PasswordInput = ({
  label,
  value,
  onChange,
  showStrength = true,
  showGenerator = true,
  required = false
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const strength = showStrength && value ? calculatePasswordStrength(value) : null;

  const handleGenerate = () => {
    const newPassword = generatePassword(16);
    onChange(newPassword);
  };

  return (
    <div className="mb-4">
      <label className="block font-mono text-sm text-green-500 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 pr-10 focus:outline-none focus:border-green-500"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-500 transition-colors"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {showGenerator && (
          <button
            type="button"
            onClick={handleGenerate}
            className="px-3 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-all"
            title="Generate Password"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>
      {strength && (
        <div className="mt-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${strength.color.replace('text-', 'bg-')}`}
                style={{ width: `${strength.strength}%` }}
              />
            </div>
            <span className={strength.color}>{strength.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};
