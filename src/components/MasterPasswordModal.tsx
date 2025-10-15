import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface MasterPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => boolean;
  onSuccess: () => void;
}

export const MasterPasswordModal = ({ isOpen, onClose, onVerify, onSuccess }: MasterPasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!password.trim()) {
      setError('Please enter master password');
      return;
    }

    if (onVerify(password)) {
      setPassword('');
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Incorrect master password');
      setPassword('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-green-500 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-green-500" />
            <h2 className="font-mono text-lg text-green-500">MASTER PASSWORD REQUIRED</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="font-mono text-sm text-gray-400 mb-4">
            Enter your master password to view account passwords
          </p>

          <div className="mb-4">
            <label className="block font-mono text-sm text-green-500 mb-2">
              Master Password
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter master password..."
              className="w-full bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 focus:outline-none focus:border-green-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 border border-red-500 bg-red-500 bg-opacity-10 mb-4">
              <AlertCircle size={16} className="text-red-500" />
              <span className="font-mono text-sm text-red-500">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 font-mono text-sm px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors"
            >
              VERIFY
            </button>
            <button
              onClick={handleClose}
              className="flex-1 font-mono text-sm px-4 py-2 border border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <p className="font-mono text-xs text-gray-600">
            Default master password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};
