import { useState, useEffect } from 'react';
import { View, Vault, Account, UserProfile } from './types';
import { storage } from './utils/storage';
import { CommandInput } from './components/CommandInput';
import { Overview } from './components/Overview';
import { Vaults } from './components/Vaults';
import { Accounts } from './components/Accounts';
import { Profile } from './components/Profile';
import { Terminal, X } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [showCLI, setShowCLI] = useState(false);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());

  useEffect(() => {
    setVaults(storage.getVaults());
    setAccounts(storage.getAccounts());
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCLI) {
        handleCloseCLI();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCLI]);

  const handleAddVault = (vaultData: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>) => {
    const newVault: Vault = {
      ...vaultData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    const updatedVaults = [...vaults, newVault];
    setVaults(updatedVaults);
    storage.saveVaults(updatedVaults);
  };

  const handleUpdateVault = (id: string, vaultData: Partial<Vault>) => {
    const updatedVaults = vaults.map(vault =>
      vault.id === id
        ? { ...vault, ...vaultData, modifiedAt: new Date() }
        : vault
    );
    setVaults(updatedVaults);
    storage.saveVaults(updatedVaults);
  };

  const handleDeleteVault = (id: string) => {
    const updatedVaults = vaults.filter(vault => vault.id !== id);
    setVaults(updatedVaults);
    storage.saveVaults(updatedVaults);

    const updatedAccounts = accounts.filter(account => account.vaultId !== id);
    setAccounts(updatedAccounts);
    storage.saveAccounts(updatedAccounts);
  };

  const handleAddAccount = (accountData: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    storage.saveAccounts(updatedAccounts);
  };

  const handleUpdateAccount = (id: string, accountData: Partial<Account>) => {
    const updatedAccounts = accounts.map(account =>
      account.id === id
        ? { ...account, ...accountData, modifiedAt: new Date() }
        : account
    );
    setAccounts(updatedAccounts);
    storage.saveAccounts(updatedAccounts);
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(account => account.id !== id);
    setAccounts(updatedAccounts);
    storage.saveAccounts(updatedAccounts);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setShowCLI(false);
  };

  const handleOpenCLI = () => {
    setShowCLI(true);
  };

  const handleCloseCLI = () => {
    setShowCLI(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview vaults={vaults} accounts={accounts} onOpenCLI={handleOpenCLI} />;
      case 'vaults':
        return (
          <Vaults
            vaults={vaults}
            onAddVault={handleAddVault}
            onUpdateVault={handleUpdateVault}
            onDeleteVault={handleDeleteVault}
          />
        );
      case 'accounts':
        return (
          <Accounts
            accounts={accounts}
            vaults={vaults}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'profile':
        return <Profile profile={profile} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <Overview vaults={vaults} accounts={accounts} onOpenCLI={handleOpenCLI} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="font-mono text-4xl font-bold mb-2 text-green-500 flex items-center justify-center gap-3">
            <Terminal size={40} />
            <span>SECURE VAULT</span>
          </div>
          <div className="font-mono text-sm text-gray-500">
            === Terminal-Based Password Management System ===
          </div>
        </div>

        <div className="border border-gray-800 p-6 md:p-8 bg-gray-950 shadow-2xl">
          {renderView()}
        </div>

        {currentView !== 'overview' && (
          <div className="mt-4 text-center">
            <button
              onClick={handleOpenCLI}
              className="font-mono text-sm text-blue-500 hover:text-blue-400 transition-colors border border-blue-500 px-4 py-2 hover:bg-blue-500 hover:bg-opacity-10"
            >
              [ OPEN CLI ]
            </button>
          </div>
        )}

        <div className="mt-4 text-center font-mono text-xs text-gray-700">
          © 2025 Secure Vault | Terminal Edition
        </div>
      </div>

      {showCLI && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-7xl bg-gray-950 border border-gray-800 shadow-2xl flex flex-col">
            <div className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-green-500" />
                <div className="font-mono text-sm text-green-500">
                  SECURE VAULT CLI
                </div>
              </div>
              <button
                onClick={handleCloseCLI}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Close CLI (or type 'exit')"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <CommandInput
                vaults={vaults}
                accounts={accounts}
                username={profile.username}
                onAddVault={handleAddVault}
                onUpdateVault={handleUpdateVault}
                onDeleteVault={handleDeleteVault}
                onAddAccount={handleAddAccount}
                onUpdateAccount={handleUpdateAccount}
                onDeleteAccount={handleDeleteAccount}
                onNavigate={handleNavigate}
                onExit={handleCloseCLI}
              />
            </div>

            <div className="border-t border-gray-800 px-4 py-2 bg-gray-900">
              <div className="font-mono text-xs text-gray-600 flex items-center justify-between">
                <div>
                  <span className="text-green-500">●</span> CONNECTED |
                  <span className="ml-2">Vaults: {vaults.length}</span> |
                  <span className="ml-2">Accounts: {accounts.length}</span>
                </div>
                <div>Type "exit" or press ESC to close</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
