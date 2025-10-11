import { Vault, Account } from '../types';
import { Folder, Key, Clock, TrendingUp, Terminal } from 'lucide-react';

interface OverviewProps {
  vaults: Vault[];
  accounts: Account[];
  onOpenCLI: () => void;
}

export const Overview = ({ vaults, accounts, onOpenCLI }: OverviewProps) => {
  const recentAccounts = [...accounts]
    .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Total Vaults', value: vaults.length, icon: Folder, color: 'text-blue-500' },
    { label: 'Total Accounts', value: accounts.length, icon: Key, color: 'text-green-500' },
    { label: 'Recent Activity', value: recentAccounts.length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Security Score', value: '85%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div>
      <div className="font-mono text-lg text-green-500 mb-6 flex items-center gap-2">
        <span className="opacity-70">╔═══</span> SYSTEM OVERVIEW <span className="opacity-70">═══╗</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-gray-700 p-4 hover:border-gray-600 transition-colors">
            <div className={`flex items-center gap-2 font-mono text-sm ${stat.color} mb-2`}>
              <stat.icon size={16} />
              {stat.label}
            </div>
            <div className="font-mono text-3xl text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div
        onClick={onOpenCLI}
        className="border border-green-500 p-4 bg-green-500 bg-opacity-5 cursor-pointer hover:bg-opacity-10 transition-all group mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Terminal size={18} className="text-green-500" />
          <div className="font-mono text-sm text-green-500">
            === COMMAND INTERFACE ===
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-green-500 opacity-70">$</span>
          <input
            type="text"
            placeholder="Click to open command interface..."
            readOnly
            className="flex-1 bg-transparent border-none text-green-500 font-mono focus:outline-none placeholder-gray-600 cursor-pointer"
          />
          <div className="font-mono text-xs text-gray-500 group-hover:text-green-500 transition-colors">
            Click or press Enter
          </div>
        </div>
      </div>

      <div className="border border-gray-700 p-4">
        <div className="font-mono text-sm text-green-500 mb-4 opacity-70">
          === RECENT ACTIVITY ===
        </div>
        {recentAccounts.length === 0 ? (
          <div className="font-mono text-sm text-gray-500 text-center py-8">
            No recent activity. Open CLI to create a vault and add accounts.
          </div>
        ) : (
          <div className="space-y-2">
            {recentAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between font-mono text-sm text-green-500 border-b border-gray-800 pb-2"
              >
                <div>
                  <span className="text-blue-400">&gt;</span> {account.name}
                </div>
                <div className="text-xs opacity-70">
                  Modified: {account.modifiedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border border-blue-500 p-4 bg-blue-500 bg-opacity-5">
        <div className="font-mono text-sm text-blue-400">
          <div className="mb-2 font-bold">💡 QUICK START</div>
          <div className="text-xs opacity-80 space-y-1">
            <div>• Click the command interface above to access the CLI</div>
            <div>• Use "help" to see all available commands</div>
            <div>• Navigate to Vaults, Accounts, or Profile pages using CLI commands</div>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-yellow-500 p-4 bg-yellow-500 bg-opacity-5">
        <div className="font-mono text-sm text-yellow-500">
          <div className="mb-2">⚠ SECURITY NOTICE</div>
          <div className="text-xs opacity-70">
            This application stores data locally in your browser. For production use, implement server-side encryption and secure storage.
          </div>
        </div>
      </div>
    </div>
  );
};
