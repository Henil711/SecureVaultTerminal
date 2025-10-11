import { useState } from 'react';
import { UserProfile } from '../types';
import { TerminalButton } from './TerminalButton';
import { TerminalInput } from './TerminalInput';
import { Save, User, Mail, Palette } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Profile = ({ profile, onUpdateProfile }: ProfileProps) => {
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const themes: Array<{ value: UserProfile['theme']; label: string; color: string }> = [
    { value: 'green', label: 'Matrix Green', color: 'text-green-500' },
    { value: 'white', label: 'Classic White', color: 'text-white' },
    { value: 'amber', label: 'Amber Glow', color: 'text-amber-500' },
  ];

  return (
    <div>
      <div className="font-mono text-lg text-green-500 mb-6 flex items-center gap-2">
        <span className="opacity-70">╔═══</span> USER PROFILE <span className="opacity-70">═══╗</span>
      </div>

      <div className="border border-gray-700 p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 border border-green-500 flex items-center justify-center">
              <User size={32} className="text-green-500" />
            </div>
            <div>
              <div className="font-mono text-green-500 text-xl">{profile.username}</div>
              <div className="font-mono text-sm text-gray-500">{profile.email}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t border-gray-800 pt-4">
            <div className="font-mono text-sm text-green-500 mb-4 flex items-center gap-2">
              <User size={16} /> ACCOUNT INFORMATION
            </div>

            <TerminalInput
              label="Username"
              value={formData.username}
              onChange={(value) => setFormData({ ...formData, username: value })}
              placeholder="Enter username..."
              required
            />

            <TerminalInput
              label="Email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              type="email"
              placeholder="Enter email..."
              required
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="font-mono text-sm text-green-500 mb-4 flex items-center gap-2">
              <Palette size={16} /> TERMINAL THEME
            </div>

            <div className="space-y-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setFormData({ ...formData, theme: theme.value })}
                  className={`
                    w-full p-3 border font-mono text-sm transition-all text-left
                    ${formData.theme === theme.value
                      ? 'border-green-500 bg-green-500 bg-opacity-10'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={theme.color}>{theme.label}</span>
                    {formData.theme === theme.value && (
                      <span className="text-green-500">[ACTIVE]</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <TerminalButton onClick={handleSave}>
              <Save size={16} className="inline mr-1" /> SAVE PROFILE
            </TerminalButton>
            {isSaved && (
              <span className="ml-4 font-mono text-sm text-green-500">
                ✓ Profile saved successfully
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-gray-700 p-6 max-w-2xl">
        <div className="font-mono text-sm text-green-500 mb-4">
          === SYSTEM INFORMATION ===
        </div>
        <div className="space-y-2 font-mono text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Version:</span>
            <span className="text-green-500">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-green-500">Local Browser Storage</span>
          </div>
          <div className="flex justify-between">
            <span>Encryption:</span>
            <span className="text-yellow-500">Client-Side Only</span>
          </div>
          <div className="flex justify-between">
            <span>Last Login:</span>
            <span className="text-green-500">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-blue-500 p-4 max-w-2xl bg-blue-500 bg-opacity-5">
        <div className="font-mono text-sm text-blue-500 mb-2">ℹ SECURITY NOTICE</div>
        <div className="font-mono text-xs text-blue-400 opacity-70">
          All data is stored locally in your browser. Clearing browser data will remove all stored passwords.
          For production use, implement proper encryption and server-side storage.
        </div>
      </div>
    </div>
  );
};
