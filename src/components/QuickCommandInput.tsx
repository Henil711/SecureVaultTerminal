import { useState, KeyboardEvent } from 'react';
import { Terminal } from 'lucide-react';
import { Vault, Account, View } from '../types';

interface QuickCommandInputProps {
  vaults: Vault[];
  accounts: Account[];
  username: string;
  onAddVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateVault: (id: string, vault: Partial<Vault>) => void;
  onDeleteVault: (id: string) => void;
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateAccount: (id: string, account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onNavigate: (view: View) => void;
}

export const QuickCommandInput = ({
  vaults,
  accounts,
  username,
  onAddVault,
  onUpdateVault,
  onDeleteVault,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onNavigate
}: QuickCommandInputProps) => {
  const [command, setCommand] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const parseArguments = (input: string): { [key: string]: string } => {
    const args: { [key: string]: string } = {};
    const regex = /--(\w+)\s+"([^"]*)"|--(\w+)\s+(\S+)/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
      const key = match[1] || match[3];
      const value = match[2] || match[4];
      args[key] = value;
    }

    return args;
  };

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const parts = trimmedCmd.split(' ');
    const mainCommand = parts[0].toLowerCase();
    const subCommand = parts[1]?.toLowerCase();
    const args = parseArguments(trimmedCmd);

    switch (mainCommand) {
      case 'exit':
      case 'quit':
        onNavigate('overview');
        showFeedback('info', 'Returning to overview...');
        break;

      case 'open':
        const pageMap: { [key: string]: View } = {
          vaults: 'vaults',
          accounts: 'accounts',
          profile: 'profile',
          overview: 'overview'
        };

        const targetPage = pageMap[subCommand];
        if (!targetPage) {
          showFeedback('error', `Unknown page "${subCommand}". Available: vaults, accounts, profile, overview`);
        } else {
          onNavigate(targetPage);
          showFeedback('success', `Opening ${subCommand} page...`);
        }
        break;

      case 'vault':
        handleVaultCommand(subCommand, args);
        break;

      case 'account':
        handleAccountCommand(subCommand, args);
        break;

      case 'help':
        showFeedback('info', 'Available commands: exit, open [page], vault [action], account [action]');
        break;

      default:
        showFeedback('error', `Unknown command: "${mainCommand}". Type "help" for available commands.`);
    }

    setCommand('');
  };

  const handleVaultCommand = (subCommand: string, flags: { [key: string]: string }) => {
    switch (subCommand) {
      case 'create':
        if (!flags.name) {
          showFeedback('error', 'Usage: vault create --name "Vault Name" [--description "Description"]');
        } else {
          onAddVault({
            name: flags.name,
            description: flags.description || ''
          });
          showFeedback('success', `Vault "${flags.name}" created successfully.`);
        }
        break;

      case 'delete':
      case 'rm':
        if (!flags.name) {
          showFeedback('error', 'Usage: vault delete --name "Vault Name"');
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.name.toLowerCase());
          if (!vault) {
            showFeedback('error', `Vault "${flags.name}" not found.`);
          } else if (window.confirm(`Delete vault "${vault.name}"? This action cannot be undone.`)) {
            onDeleteVault(vault.id);
            showFeedback('success', `Vault "${flags.name}" deleted.`);
          }
        }
        break;

      default:
        showFeedback('error', 'Unknown vault command. Use: create, delete');
    }
  };

  const handleAccountCommand = (subCommand: string, flags: { [key: string]: string }) => {
    switch (subCommand) {
      case 'create':
        if (!flags.vault || !flags.name || !flags.username || !flags.password) {
          showFeedback('error', 'Usage: account create --vault "Vault" --name "Name" --username "user" --password "pass"');
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.vault.toLowerCase());
          if (!vault) {
            showFeedback('error', `Vault "${flags.vault}" not found.`);
          } else {
            onAddAccount({
              vaultId: vault.id,
              name: flags.name,
              username: flags.username,
              password: flags.password,
              url: flags.url || '',
              notes: flags.notes || ''
            });
            showFeedback('success', `Account "${flags.name}" created successfully.`);
          }
        }
        break;

      case 'delete':
      case 'rm':
        if (!flags.name) {
          showFeedback('error', 'Usage: account delete --name "Account Name"');
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            showFeedback('error', `Account "${flags.name}" not found.`);
          } else if (window.confirm(`Delete account "${account.name}"? This action cannot be undone.`)) {
            onDeleteAccount(account.id);
            showFeedback('success', `Account "${flags.name}" deleted.`);
          }
        }
        break;

      case 'password':
        if (!flags.name) {
          showFeedback('error', 'Usage: account password --name "Account Name"');
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            showFeedback('error', `Account "${flags.name}" not found.`);
          } else {
            navigator.clipboard.writeText(account.password);
            showFeedback('success', `Password for "${account.name}" copied to clipboard.`);
          }
        }
        break;

      default:
        showFeedback('error', 'Unknown account command. Use: create, delete, password');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    }
  };

  return (
    <div className="mb-6">
      <div className="border border-gray-700 bg-gray-950 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={14} className="text-green-500" />
          <span className="font-mono text-xs text-gray-500">QUICK COMMAND</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-green-500 text-sm">
            {username}@securevaultterminal
          </span>
          <span className="font-mono text-blue-400 text-sm">~</span>
          <span className="font-mono text-green-500">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (exit, open [page], help)..."
            className="flex-1 bg-transparent text-green-500 font-mono text-sm focus:outline-none placeholder-gray-700"
          />
        </div>
        {feedback && (
          <div className={`
            mt-2 font-mono text-xs p-2 border
            ${feedback.type === 'success' ? 'text-green-500 border-green-700 bg-green-500 bg-opacity-10' : ''}
            ${feedback.type === 'error' ? 'text-red-500 border-red-700 bg-red-500 bg-opacity-10' : ''}
            ${feedback.type === 'info' ? 'text-blue-500 border-blue-700 bg-blue-500 bg-opacity-10' : ''}
          `}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};
