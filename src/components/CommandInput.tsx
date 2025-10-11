import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Terminal, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Vault, Account, View } from '../types';

interface CommandInputProps {
  vaults: Vault[];
  accounts: Account[];
  username: string;
  onAddVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateVault: (id: string, vault: Partial<Vault>) => void;
  onDeleteVault: (id: string) => void;
  onAddAccount: (account: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onUpdateAccount: (id: string, account: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onNavigate?: (view: View) => void;
  onExit?: () => void;
}

interface CommandResult {
  type: 'success' | 'error' | 'info' | 'prompt';
  message: string;
  data?: any;
}

interface PendingOperation {
  type: 'create-vault' | 'create-account' | 'update-vault' | 'update-account' | 'delete-vault' | 'delete-account';
  data: any;
}

export const CommandInput = ({
  vaults,
  accounts,
  username,
  onAddVault,
  onUpdateVault,
  onDeleteVault,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onNavigate,
  onExit
}: CommandInputProps) => {
  const [command, setCommand] = useState('');
  const [results, setResults] = useState<CommandResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pendingOperation, setPendingOperation] = useState<PendingOperation | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [results]);

  const commandList = [
    'help',
    'clear',
    'exit',
    'open vaults',
    'open accounts',
    'open profile',
    'open overview',
    'vault list',
    'vault create',
    'vault update',
    'vault delete',
    'vault show',
    'account list',
    'account create',
    'account update',
    'account delete',
    'account show',
    'account password',
    'search',
    'stats',
  ];

  useEffect(() => {
    if (command.trim()) {
      const matches = commandList.filter(cmd =>
        cmd.toLowerCase().startsWith(command.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [command]);

  const addResult = (result: CommandResult) => {
    setResults(prev => [...prev, result]);
  };

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

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();

    if (!trimmedCmd) {
      return;
    }

    addResult({
      type: 'info',
      message: `> ${trimmedCmd}`,
    });

    setHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    const parts = trimmedCmd.split(' ');
    const mainCommand = parts[0].toLowerCase();
    const subCommand = parts[1]?.toLowerCase();
    const args = parseArguments(trimmedCmd);

    if (pendingOperation) {
      handlePendingOperation(trimmedCmd);
      return;
    }

    switch (mainCommand) {
      case 'help':
      case '--help':
      case '-h':
        showHelp(subCommand);
        break;

      case 'clear':
        setResults([]);
        break;

      case 'exit':
      case 'quit':
        if (onExit) {
          addResult({ type: 'info', message: 'Exiting CLI...' });
          setTimeout(() => onExit(), 500);
        } else {
          addResult({ type: 'error', message: 'Cannot exit from this context.' });
        }
        break;

      case 'open':
        handleOpenCommand(subCommand);
        break;

      case 'vault':
        handleVaultCommand(subCommand, parts.slice(2), args);
        break;

      case 'account':
        handleAccountCommand(subCommand, parts.slice(2), args);
        break;

      case 'search':
        handleSearchCommand(parts.slice(1).join(' '));
        break;

      case 'stats':
        handleStatsCommand();
        break;

      default:
        addResult({
          type: 'error',
          message: `Unknown command: "${mainCommand}". Type "help" for available commands.`,
        });
    }

    setCommand('');
    setSuggestions([]);
  };

  const handlePendingOperation = (input: string) => {
    if (!pendingOperation) return;

    if (input.toLowerCase() === 'cancel' || input.toLowerCase() === 'no') {
      addResult({ type: 'info', message: 'Operation cancelled.' });
      setPendingOperation(null);
      setCommand('');
      return;
    }

    if (pendingOperation.type === 'delete-vault' || pendingOperation.type === 'delete-account') {
      if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'confirm') {
        if (pendingOperation.type === 'delete-vault') {
          onDeleteVault(pendingOperation.data.id);
          addResult({ type: 'success', message: `Vault "${pendingOperation.data.name}" deleted successfully.` });
        } else {
          onDeleteAccount(pendingOperation.data.id);
          addResult({ type: 'success', message: `Account "${pendingOperation.data.name}" deleted successfully.` });
        }
        setPendingOperation(null);
      } else {
        addResult({ type: 'error', message: 'Please type "yes" or "confirm" to proceed, or "cancel" to abort.' });
      }
    }

    setCommand('');
  };

  const handleOpenCommand = (page: string) => {
    if (!onNavigate) {
      addResult({ type: 'error', message: 'Navigation not available in this context.' });
      return;
    }

    const pageMap: { [key: string]: View } = {
      vaults: 'vaults',
      accounts: 'accounts',
      profile: 'profile',
      overview: 'overview'
    };

    const targetPage = pageMap[page];

    if (!targetPage) {
      addResult({
        type: 'error',
        message: `Unknown page "${page}". Available pages: vaults, accounts, profile, overview`,
      });
    } else {
      addResult({ type: 'success', message: `Opening ${page} page...` });
      setTimeout(() => onNavigate(targetPage), 500);
    }
  };

  const handleVaultCommand = (subCommand: string, args: string[], flags: { [key: string]: string }) => {
    switch (subCommand) {
      case 'list':
      case 'ls':
        if (vaults.length === 0) {
          addResult({ type: 'info', message: 'No vaults found. Use "vault create" to create one.' });
        } else {
          addResult({
            type: 'success',
            message: `Found ${vaults.length} vault${vaults.length !== 1 ? 's' : ''}:`,
            data: { type: 'vaults', items: vaults }
          });
        }
        break;

      case 'create':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: vault create --name "Vault Name" [--description "Description"]',
          });
        } else {
          onAddVault({
            name: flags.name,
            description: flags.description || ''
          });
          addResult({ type: 'success', message: `Vault "${flags.name}" created successfully.` });
        }
        break;

      case 'update':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: vault update --name "Vault Name" [--newname "New Name"] [--description "New Description"]',
          });
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.name.toLowerCase());
          if (!vault) {
            addResult({ type: 'error', message: `Vault "${flags.name}" not found.` });
          } else {
            const updates: Partial<Vault> = {};
            if (flags.newname) updates.name = flags.newname;
            if (flags.description) updates.description = flags.description;

            onUpdateVault(vault.id, updates);
            addResult({ type: 'success', message: `Vault "${flags.name}" updated successfully.` });
          }
        }
        break;

      case 'delete':
      case 'rm':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: vault delete --name "Vault Name"',
          });
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.name.toLowerCase());
          if (!vault) {
            addResult({ type: 'error', message: `Vault "${flags.name}" not found.` });
          } else {
            const vaultAccounts = accounts.filter(a => a.vaultId === vault.id);
            setPendingOperation({ type: 'delete-vault', data: vault });
            addResult({
              type: 'prompt',
              message: `WARNING: Delete vault "${vault.name}"? This will also delete ${vaultAccounts.length} account(s). Type "yes" to confirm or "cancel" to abort.`,
            });
          }
        }
        break;

      case 'show':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: vault show --name "Vault Name"',
          });
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.name.toLowerCase());
          if (!vault) {
            addResult({ type: 'error', message: `Vault "${flags.name}" not found.` });
          } else {
            const vaultAccounts = accounts.filter(a => a.vaultId === vault.id);
            addResult({
              type: 'success',
              message: `Vault: ${vault.name}`,
              data: { type: 'vault-detail', vault, accounts: vaultAccounts }
            });
          }
        }
        break;

      default:
        addResult({
          type: 'error',
          message: 'Unknown vault command. Use: list, create, update, delete, show',
        });
    }
  };

  const handleAccountCommand = (subCommand: string, args: string[], flags: { [key: string]: string }) => {
    switch (subCommand) {
      case 'list':
      case 'ls':
        let accountsToShow = accounts;

        if (flags.vault) {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.vault.toLowerCase());
          if (!vault) {
            addResult({ type: 'error', message: `Vault "${flags.vault}" not found.` });
            return;
          }
          accountsToShow = accounts.filter(a => a.vaultId === vault.id);
        }

        if (accountsToShow.length === 0) {
          addResult({ type: 'info', message: 'No accounts found. Use "account create" to create one.' });
        } else {
          addResult({
            type: 'success',
            message: `Found ${accountsToShow.length} account${accountsToShow.length !== 1 ? 's' : ''}:`,
            data: { type: 'accounts', items: accountsToShow }
          });
        }
        break;

      case 'create':
        if (!flags.vault || !flags.name || !flags.username || !flags.password) {
          addResult({
            type: 'error',
            message: 'Usage: account create --vault "Vault Name" --name "Account Name" --username "user" --password "pass" [--url "https://..."] [--notes "notes"]',
          });
        } else {
          const vault = vaults.find(v => v.name.toLowerCase() === flags.vault.toLowerCase());
          if (!vault) {
            addResult({ type: 'error', message: `Vault "${flags.vault}" not found.` });
          } else {
            onAddAccount({
              vaultId: vault.id,
              name: flags.name,
              username: flags.username,
              password: flags.password,
              url: flags.url || '',
              notes: flags.notes || ''
            });
            addResult({ type: 'success', message: `Account "${flags.name}" created successfully in vault "${vault.name}".` });
          }
        }
        break;

      case 'update':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: account update --name "Account Name" [--newname "New Name"] [--username "user"] [--password "pass"] [--url "url"] [--notes "notes"]',
          });
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            addResult({ type: 'error', message: `Account "${flags.name}" not found.` });
          } else {
            const updates: Partial<Account> = {};
            if (flags.newname) updates.name = flags.newname;
            if (flags.username) updates.username = flags.username;
            if (flags.password) updates.password = flags.password;
            if (flags.url) updates.url = flags.url;
            if (flags.notes) updates.notes = flags.notes;

            onUpdateAccount(account.id, updates);
            addResult({ type: 'success', message: `Account "${flags.name}" updated successfully.` });
          }
        }
        break;

      case 'delete':
      case 'rm':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: account delete --name "Account Name"',
          });
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            addResult({ type: 'error', message: `Account "${flags.name}" not found.` });
          } else {
            setPendingOperation({ type: 'delete-account', data: account });
            addResult({
              type: 'prompt',
              message: `Delete account "${account.name}"? Type "yes" to confirm or "cancel" to abort.`,
            });
          }
        }
        break;

      case 'show':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: account show --name "Account Name" [--reveal]',
          });
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            addResult({ type: 'error', message: `Account "${flags.name}" not found.` });
          } else {
            const vault = vaults.find(v => v.id === account.vaultId);
            addResult({
              type: 'success',
              message: `Account: ${account.name}`,
              data: { type: 'account-detail', account, vault, reveal: flags.reveal !== undefined }
            });
          }
        }
        break;

      case 'password':
        if (!flags.name) {
          addResult({
            type: 'error',
            message: 'Usage: account password --name "Account Name"',
          });
        } else {
          const account = accounts.find(a => a.name.toLowerCase() === flags.name.toLowerCase());
          if (!account) {
            addResult({ type: 'error', message: `Account "${flags.name}" not found.` });
          } else {
            addResult({
              type: 'success',
              message: `Password for "${account.name}": ${account.password}\n\n(Copied to clipboard)`,
            });
            navigator.clipboard.writeText(account.password);
          }
        }
        break;

      default:
        addResult({
          type: 'error',
          message: 'Unknown account command. Use: list, create, update, delete, show, password',
        });
    }
  };

  const handleSearchCommand = (query: string) => {
    if (!query) {
      addResult({ type: 'error', message: 'Usage: search <query>' });
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matchedVaults = vaults.filter(v =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.description.toLowerCase().includes(lowerQuery)
    );
    const matchedAccounts = accounts.filter(a =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.username.toLowerCase().includes(lowerQuery) ||
      a.url.toLowerCase().includes(lowerQuery)
    );

    if (matchedVaults.length === 0 && matchedAccounts.length === 0) {
      addResult({ type: 'info', message: `No results found for "${query}".` });
    } else {
      addResult({
        type: 'success',
        message: `Search results for "${query}":`,
        data: { type: 'search', vaults: matchedVaults, accounts: matchedAccounts }
      });
    }
  };

  const handleStatsCommand = () => {
    const totalVaults = vaults.length;
    const totalAccounts = accounts.length;
    const recentAccounts = accounts
      .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
      .slice(0, 5);

    addResult({
      type: 'success',
      message: 'System Statistics',
      data: { type: 'stats', totalVaults, totalAccounts, recentAccounts }
    });
  };

  const showHelp = (topic?: string) => {
    if (topic) {
      const helpTopics: { [key: string]: string } = {
        vault: `VAULT COMMANDS:
  vault list                                     - List all vaults
  vault create --name "Name" [--description ""]  - Create new vault
  vault update --name "Name" [--newname ""] [--description ""]
  vault delete --name "Name"                     - Delete vault
  vault show --name "Name"                       - Show vault details

EXAMPLES:
  vault create --name "Personal" --description "My personal accounts"
  vault update --name "Personal" --newname "Private"
  vault delete --name "Old Vault"`,

        account: `ACCOUNT COMMANDS:
  account list [--vault "Vault"]                 - List accounts
  account create --vault "V" --name "N" --username "U" --password "P" [--url ""] [--notes ""]
  account update --name "Name" [--newname ""] [--username ""] [--password ""] [--url ""] [--notes ""]
  account delete --name "Name"                   - Delete account
  account show --name "Name" [--reveal]          - Show account details
  account password --name "Name"                 - Copy password to clipboard

EXAMPLES:
  account create --vault "Personal" --name "Gmail" --username "user@gmail.com" --password "pass123"
  account update --name "Gmail" --password "newpass456"
  account password --name "Gmail"`,

        search: `SEARCH COMMAND:
  search <query>                                 - Search vaults and accounts

EXAMPLES:
  search gmail
  search personal`,
      };

      if (helpTopics[topic]) {
        addResult({ type: 'info', message: helpTopics[topic] });
      } else {
        addResult({ type: 'error', message: `No help available for "${topic}". Try: vault, account, search` });
      }
    } else {
      addResult({
        type: 'info',
        message: `SECURE VAULT CLI - Available Commands:

GENERAL:
  help [topic]     - Show help (topics: vault, account, search)
  clear            - Clear terminal output
  stats            - Show system statistics
  exit             - Exit CLI and return to overview

NAVIGATION:
  open overview    - Return to overview page
  open vaults      - Open vaults management page
  open accounts    - Open accounts management page
  open profile     - Open profile settings page

VAULT MANAGEMENT:
  vault list       - List all vaults
  vault create     - Create new vault
  vault update     - Update vault
  vault delete     - Delete vault
  vault show       - Show vault details

ACCOUNT MANAGEMENT:
  account list     - List all accounts
  account create   - Create new account
  account update   - Update account
  account delete   - Delete account
  account show     - Show account details
  account password - Get password

OTHER:
  search <query>   - Search vaults and accounts

Type "help <topic>" for detailed information (e.g., "help vault")
Use Tab for auto-completion, ↑/↓ for history`
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCommand(suggestions[0]);
        setSuggestions([]);
      }
    }
  };

  const renderData = (data: any) => {
    if (!data) return null;

    switch (data.type) {
      case 'vaults':
        return (
          <div className="mt-3 space-y-2">
            {data.items.map((vault: Vault, index: number) => (
              <div key={vault.id} className="border border-gray-700 p-3 bg-black">
                <div className="font-mono text-sm text-green-500">
                  [{index + 1}] {vault.name}
                </div>
                {vault.description && (
                  <div className="font-mono text-xs text-gray-400 mt-1">{vault.description}</div>
                )}
                <div className="font-mono text-xs text-gray-600 mt-1">
                  Created: {vault.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        );

      case 'accounts':
        return (
          <div className="mt-3 space-y-2">
            {data.items.map((account: Account, index: number) => {
              const vault = vaults.find(v => v.id === account.vaultId);
              return (
                <div key={account.id} className="border border-gray-700 p-3 bg-black">
                  <div className="font-mono text-sm text-green-500">
                    [{index + 1}] {account.name}
                  </div>
                  <div className="font-mono text-xs text-gray-400 mt-1 space-y-1">
                    <div>Username: {account.username}</div>
                    <div>Vault: {vault?.name || 'Unknown'}</div>
                    {account.url && <div>URL: {account.url}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'vault-detail':
        return (
          <div className="mt-3 border border-green-700 p-4 bg-black">
            <div className="font-mono text-sm space-y-2">
              <div><span className="text-gray-500">Description:</span> <span className="text-green-500">{data.vault.description || 'N/A'}</span></div>
              <div><span className="text-gray-500">Accounts:</span> <span className="text-green-500">{data.accounts.length}</span></div>
              <div><span className="text-gray-500">Created:</span> <span className="text-green-500">{data.vault.createdAt.toLocaleString()}</span></div>
              <div><span className="text-gray-500">Modified:</span> <span className="text-green-500">{data.vault.modifiedAt.toLocaleString()}</span></div>
            </div>
            {data.accounts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="font-mono text-xs text-gray-500 mb-2">Accounts in this vault:</div>
                {data.accounts.map((acc: Account) => (
                  <div key={acc.id} className="font-mono text-xs text-green-500 ml-2">• {acc.name}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'account-detail':
        return (
          <div className="mt-3 border border-green-700 p-4 bg-black">
            <div className="font-mono text-sm space-y-2">
              <div><span className="text-gray-500">Username:</span> <span className="text-green-500">{data.account.username}</span></div>
              <div><span className="text-gray-500">Password:</span> <span className="text-green-500">{data.reveal ? data.account.password : '••••••••••'}</span></div>
              <div><span className="text-gray-500">URL:</span> <span className="text-green-500">{data.account.url || 'N/A'}</span></div>
              <div><span className="text-gray-500">Vault:</span> <span className="text-green-500">{data.vault?.name || 'Unknown'}</span></div>
              {data.account.notes && <div><span className="text-gray-500">Notes:</span> <span className="text-green-500">{data.account.notes}</span></div>}
              <div><span className="text-gray-500">Modified:</span> <span className="text-green-500">{data.account.modifiedAt.toLocaleString()}</span></div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="mt-3 space-y-3">
            {data.vaults.length > 0 && (
              <div>
                <div className="font-mono text-xs text-blue-400 mb-2">Vaults ({data.vaults.length}):</div>
                {data.vaults.map((vault: Vault) => (
                  <div key={vault.id} className="border border-gray-700 p-2 bg-black mb-1">
                    <div className="font-mono text-sm text-green-500">{vault.name}</div>
                  </div>
                ))}
              </div>
            )}
            {data.accounts.length > 0 && (
              <div>
                <div className="font-mono text-xs text-blue-400 mb-2">Accounts ({data.accounts.length}):</div>
                {data.accounts.map((account: Account) => (
                  <div key={account.id} className="border border-gray-700 p-2 bg-black mb-1">
                    <div className="font-mono text-sm text-green-500">{account.name}</div>
                    <div className="font-mono text-xs text-gray-400">@{account.username}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="mt-3 border border-green-700 p-4 bg-black">
            <div className="font-mono text-sm space-y-2">
              <div><span className="text-gray-500">Total Vaults:</span> <span className="text-green-500">{data.totalVaults}</span></div>
              <div><span className="text-gray-500">Total Accounts:</span> <span className="text-green-500">{data.totalAccounts}</span></div>
              {data.recentAccounts.length > 0 && (
                <div>
                  <div className="text-gray-500 mt-3 mb-1">Recent Activity:</div>
                  {data.recentAccounts.map((acc: Account) => (
                    <div key={acc.id} className="text-green-500 text-xs ml-2">
                      • {acc.name} - {acc.modifiedAt.toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const icons = {
    success: <CheckCircle size={14} className="text-green-500 flex-shrink-0" />,
    error: <AlertCircle size={14} className="text-red-500 flex-shrink-0" />,
    info: <Info size={14} className="text-blue-500 flex-shrink-0" />,
    prompt: <AlertCircle size={14} className="text-yellow-500 flex-shrink-0" />,
  };

  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-400',
    prompt: 'text-yellow-500',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-700 p-4 bg-black">
        {results.length === 0 ? (
          <div className="font-mono text-gray-600 text-sm">
            Welcome to Secure Vault CLI. Type "help" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="font-mono text-sm">
                <div className={`flex items-start gap-2 ${colors[result.type]}`}>
                  {icons[result.type]}
                  <div className="flex-1 whitespace-pre-line">{result.message}</div>
                </div>
                {renderData(result.data)}
              </div>
            ))}
          </div>
        )}
        <div ref={resultsEndRef} />
      </div>

      <div className="border border-green-500 bg-gray-950">
        {suggestions.length > 0 && (
          <div className="border-b border-gray-700 p-2 bg-gray-900">
            <div className="font-mono text-xs text-gray-500 mb-1">Suggestions (Tab to complete):</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCommand(sug);
                    setSuggestions([]);
                  }}
                  className="px-2 py-1 border border-gray-700 text-blue-400 hover:border-blue-500 font-mono text-xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3">
          <Terminal size={16} className="text-green-500" />
          <span className="font-mono text-green-500 text-sm">
            {username}@securevaultterminal
          </span>
          <span className="font-mono text-blue-400 text-sm">~</span>
          <span className="font-mono text-green-500">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command... (help for commands)"
            className="flex-1 bg-transparent text-green-500 font-mono focus:outline-none placeholder-gray-700"
          />
        </div>
      </div>
    </div>
  );
};
