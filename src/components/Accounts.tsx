import { useState } from 'react';
import { Account, Vault, UserProfile } from '../types';
import { TerminalButton } from './TerminalButton';
import { TerminalInput } from './TerminalInput';
import { TerminalTextarea } from './TerminalTextarea';
import { PasswordInput } from './PasswordInput';
import { MasterPasswordModal } from './MasterPasswordModal';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface AccountsProps {
  accounts: Account[];
  vaults: Vault[];
  profile: UserProfile;
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateAccount: (id: string, account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
}

export const Accounts = ({ accounts, vaults, profile, onAddAccount, onUpdateAccount, onDeleteAccount }: AccountsProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [pendingPasswordView, setPendingPasswordView] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vaultId: '',
    name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  const filteredAccounts = selectedVaultFilter === 'all'
    ? accounts
    : accounts.filter(acc => acc.vaultId === selectedVaultFilter);

  const handleCreate = () => {
    if (!formData.vaultId || !formData.name.trim() || !formData.username.trim() || !formData.password.trim()) return;
    onAddAccount(formData);
    setFormData({ vaultId: '', name: '', username: '', password: '', url: '', notes: '' });
    setIsCreating(false);
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setFormData({
      vaultId: account.vaultId,
      name: account.name,
      username: account.username,
      password: account.password,
      url: account.url,
      notes: account.notes
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim() || !formData.username.trim() || !formData.password.trim()) return;
    onUpdateAccount(editingId, formData);
    setEditingId(null);
    setFormData({ vaultId: '', name: '', username: '', password: '', url: '', notes: '' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ vaultId: '', name: '', username: '', password: '', url: '', notes: '' });
  };

  const togglePasswordVisibility = (id: string) => {
    const isVisible = visiblePasswords.has(id);

    if (isVisible) {
      setVisiblePasswords(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      setPendingPasswordView(id);
      setShowMasterPasswordModal(true);
    }
  };

  const handleMasterPasswordVerify = (password: string): boolean => {
    return password === profile.masterPassword;
  };

  const handleMasterPasswordSuccess = () => {
    if (pendingPasswordView) {
      setVisiblePasswords(prev => {
        const newSet = new Set(prev);
        newSet.add(pendingPasswordView);
        return newSet;
      });
      setPendingPasswordView(null);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="font-mono text-lg text-green-500 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="opacity-70">╔═══</span> ACCOUNT MANAGEMENT <span className="opacity-70">═══╗</span>
        </div>
        {!isCreating && !editingId && (
          <TerminalButton onClick={() => setIsCreating(true)} disabled={vaults.length === 0}>
            <Plus size={16} className="inline mr-1" /> NEW ACCOUNT
          </TerminalButton>
        )}
      </div>

      {vaults.length === 0 && (
        <div className="border border-yellow-500 p-4 mb-6 bg-yellow-500 bg-opacity-5">
          <div className="font-mono text-sm text-yellow-500">
            ⚠ Create a vault first before adding accounts.
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block font-mono text-sm text-green-500 mb-2">Filter by Vault</label>
        <select
          value={selectedVaultFilter}
          onChange={(e) => setSelectedVaultFilter(e.target.value)}
          className="w-full md:w-64 bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="all">All Vaults</option>
          {vaults.map(vault => (
            <option key={vault.id} value={vault.id}>{vault.name}</option>
          ))}
        </select>
      </div>

      {(isCreating || editingId) && (
        <div className="border border-green-500 p-6 mb-6 bg-green-500 bg-opacity-5">
          <div className="font-mono text-sm text-green-500 mb-4">
            {isCreating ? '&gt; CREATE NEW ACCOUNT' : '&gt; EDIT ACCOUNT'}
          </div>

          <div className="mb-4">
            <label className="block font-mono text-sm text-green-500 mb-2">
              Vault <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vaultId}
              onChange={(e) => setFormData({ ...formData, vaultId: e.target.value })}
              required
              className="w-full bg-black border border-gray-700 text-green-500 font-mono px-3 py-2 focus:outline-none focus:border-green-500"
            >
              <option value="">Select a vault...</option>
              {vaults.map(vault => (
                <option key={vault.id} value={vault.id}>{vault.name}</option>
              ))}
            </select>
          </div>

          <TerminalInput
            label="Account Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="e.g., Gmail, GitHub, etc."
            required
          />

          <TerminalInput
            label="Username / Email"
            value={formData.username}
            onChange={(value) => setFormData({ ...formData, username: value })}
            placeholder="Enter username or email..."
            required
          />

          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            required
          />

          <TerminalInput
            label="URL"
            value={formData.url}
            onChange={(value) => setFormData({ ...formData, url: value })}
            type="url"
            placeholder="https://example.com"
          />

          <TerminalTextarea
            label="Notes"
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder="Additional notes..."
            rows={3}
          />

          <div className="flex gap-3">
            <TerminalButton onClick={isCreating ? handleCreate : handleUpdate}>
              <Save size={16} className="inline mr-1" /> SAVE
            </TerminalButton>
            <TerminalButton onClick={handleCancel} variant="secondary">
              <X size={16} className="inline mr-1" /> CANCEL
            </TerminalButton>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredAccounts.length === 0 ? (
          <div className="border border-gray-700 p-8 text-center">
            <div className="font-mono text-gray-500 mb-4">
              {accounts.length === 0
                ? 'No accounts found. Create your first account to get started.'
                : 'No accounts in this vault.'
              }
            </div>
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const vault = vaults.find(v => v.id === account.vaultId);
            const isPasswordVisible = visiblePasswords.has(account.id);

            return (
              <div key={account.id} className="border border-gray-700 p-4 hover:border-green-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono text-green-500 font-bold mb-1">
                      <span className="text-blue-400">&gt;</span> {account.name}
                    </div>
                    <div className="font-mono text-xs text-gray-500">
                      Vault: {vault?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                      title="Edit Account"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete account "${account.name}"? This action cannot be undone.`)) {
                          onDeleteAccount(account.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-24">Username:</span>
                    <span className="text-green-500">{account.username}</span>
                    <button
                      onClick={() => copyToClipboard(account.username, `${account.id}-username`)}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                      title="Copy Username"
                    >
                      {copiedId === `${account.id}-username` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-24">Password:</span>
                    <span className="text-green-500 flex-1">
                      {isPasswordVisible ? account.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(account.id)}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                      title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                    >
                      {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(account.password, `${account.id}-password`)}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                      title="Copy Password"
                    >
                      {copiedId === `${account.id}-password` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {account.url && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">URL:</span>
                      <a
                        href={account.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 underline"
                      >
                        {account.url}
                      </a>
                    </div>
                  )}

                  {account.notes && (
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-24">Notes:</span>
                      <span className="text-gray-400 flex-1">{account.notes}</span>
                    </div>
                  )}
                </div>

                <div className="font-mono text-xs text-gray-600 mt-3 pt-3 border-t border-gray-800">
                  Modified: {account.modifiedAt.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      <MasterPasswordModal
        isOpen={showMasterPasswordModal}
        onClose={() => {
          setShowMasterPasswordModal(false);
          setPendingPasswordView(null);
        }}
        onVerify={handleMasterPasswordVerify}
        onSuccess={handleMasterPasswordSuccess}
      />
    </div>
  );
};
