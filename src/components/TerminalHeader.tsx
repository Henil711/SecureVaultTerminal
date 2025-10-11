import { UserProfile } from '../types';

interface TerminalHeaderProps {
  profile: UserProfile;
  currentView: string;
}

export const TerminalHeader = ({ profile, currentView }: TerminalHeaderProps) => {
  const themeColors = {
    green: 'text-green-500',
    white: 'text-white',
    amber: 'text-amber-500',
  };

  return (
    <div className="border-b border-gray-700 pb-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`font-mono text-sm ${themeColors[profile.theme]}`}>
          <span className="opacity-70">{profile.username}@passwordmanager</span>
          <span className="opacity-50">:</span>
          <span className="text-blue-400">~/{currentView}</span>
          <span className="opacity-70">$</span>
          <span className="animate-pulse ml-1">_</span>
        </div>
        <div className={`font-mono text-xs ${themeColors[profile.theme]} opacity-50`}>
          {new Date().toLocaleString()}
        </div>
      </div>
      <div className={`font-mono text-xs ${themeColors[profile.theme]} opacity-70`}>
        ┌─────────────────────────────────────────────────────────────────────┐
      </div>
    </div>
  );
};
