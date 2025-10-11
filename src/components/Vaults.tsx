import { useState } from 'react';
import { Vault } from '../types';
import { TerminalButton } from './TerminalButton';
import { TerminalInput } from './TerminalInput';
import { TerminalTextarea } from './TerminalTextarea';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface VaultsProps {
  vaults: Vault[];
  onAddVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateVault: (id: string, vault: Partial<Vault>) => void;
  onDeleteVault: (id: string) => void;
}

export const Vaults = ({ vaults, onAddVault, onUpdateVault, onDeleteVault }: VaultsProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    onAddVault(formData);
    setFormData({ name: '', description: '' });
    setIsCreating(false);
  };

  const handleEdit = (vault: Vault) => {
    setEditingId(vault.id);
    setFormData({ name: vault.name, description: vault.description });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) return;
    onUpdateVault(editingId, formData);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div>
      <div className="font-mono text-lg text-green-500 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="opacity-70">╔═══</span> VAULT MANAGEMENT <span className="opacity-70">═══╗</span>
        </div>
        {!isCreating && !editingId && (
          <TerminalButton onClick={() => setIsCreating(true)}>
            <Plus size={16} className="inline mr-1" /> NEW VAULT
          </TerminalButton>
        )}
      </div>

      {(isCreating || editingId) && (
        <div className="border border-green-500 p-6 mb-6 bg-green-500 bg-opacity-5">
          <div className="font-mono text-sm text-green-500 mb-4">
            {isCreating ? '&gt; CREATE NEW VAULT' : '&gt; EDIT VAULT'}
          </div>
          <TerminalInput
            label="Vault Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter vault name..."
            required
          />
          <TerminalTextarea
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter vault description..."
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
        {vaults.length === 0 ? (
          <div className="border border-gray-700 p-8 text-center">
            <div className="font-mono text-gray-500 mb-4">
              No vaults found. Create your first vault to get started.
            </div>
          </div>
        ) : (
          vaults.map((vault) => (
            <div key={vault.id} className="border border-gray-700 p-4 hover:border-green-500 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-mono text-green-500 font-bold mb-1">
                    <span className="text-blue-400">&gt;</span> {vault.name}
                  </div>
                  {vault.description && (
                    <div className="font-mono text-sm text-gray-400">{vault.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vault)}
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                    title="Edit Vault"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete vault "${vault.name}"? This action cannot be undone.`)) {
                        onDeleteVault(vault.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    title="Delete Vault"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="font-mono text-xs text-gray-600">
                Created: {vault.createdAt.toLocaleDateString()} | Modified: {vault.modifiedAt.toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
