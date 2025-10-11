import { View } from '../types';
import { Home, Folder, Key, User } from 'lucide-react';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  const navItems: { view: View; label: string; icon: typeof Home }[] = [
    { view: 'overview', label: 'OVERVIEW', icon: Home },
    { view: 'vaults', label: 'VAULTS', icon: Folder },
    { view: 'accounts', label: 'ACCOUNTS', icon: Key },
    { view: 'profile', label: 'PROFILE', icon: User },
  ];

  return (
    <div className="border border-gray-700 p-4 mb-6">
      <div className="font-mono text-xs text-green-500 mb-3 opacity-70">
        === NAVIGATION ===
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 border font-mono text-sm transition-all
              ${currentView === view
                ? 'border-green-500 bg-green-500 text-black'
                : 'border-gray-600 text-green-500 hover:border-green-500'
              }
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
