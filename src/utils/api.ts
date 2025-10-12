import { Vault, Account } from '../types';

const API_BASE_URL = 'https://68eb59be76b3362414cd6f41.mockapi.io/api';

interface ApiVault {
  id: string;
  UserId: string;
  Name: string;
  Description: string;
}

interface ApiAccount {
  id: string;
  UserId: string;
  VaultId: string;
  Name: string;
  Password: string;
  Url: string;
  Notes: string;
}

const mapApiVaultToVault = (apiVault: ApiVault): Vault => ({
  id: apiVault.id,
  name: apiVault.Name,
  description: apiVault.Description,
  createdAt: new Date(),
  modifiedAt: new Date()
});

const mapVaultToApiVault = (vault: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>): Omit<ApiVault, 'id'> => ({
  UserId: 'user123',
  Name: vault.name,
  Description: vault.description
});

const mapApiAccountToAccount = (apiAccount: ApiAccount): Account => ({
  id: apiAccount.id,
  vaultId: apiAccount.VaultId,
  name: apiAccount.Name,
  username: apiAccount.UserId,
  password: String(apiAccount.Password),
  url: apiAccount.Url,
  notes: apiAccount.Notes,
  createdAt: new Date(),
  modifiedAt: new Date()
});

const mapAccountToApiAccount = (account: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>): Omit<ApiAccount, 'id'> => ({
  UserId: account.username,
  VaultId: account.vaultId,
  Name: account.name,
  Password: account.password,
  Url: account.url,
  Notes: account.notes
});

export const api = {
  vaults: {
    getAll: async (): Promise<Vault[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Vaults`);
        if (!response.ok) throw new Error('Failed to fetch vaults');
        const data: ApiVault[] = await response.json();
        return data.map(mapApiVaultToVault);
      } catch (error) {
        console.error('Error fetching vaults:', error);
        return [];
      }
    },

    create: async (vault: Omit<Vault, 'id' | 'createdAt' | 'modifiedAt'>): Promise<Vault | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Vaults`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mapVaultToApiVault(vault)),
        });
        if (!response.ok) throw new Error('Failed to create vault');
        const data: ApiVault = await response.json();
        return mapApiVaultToVault(data);
      } catch (error) {
        console.error('Error creating vault:', error);
        return null;
      }
    },

    update: async (id: string, vault: Partial<Vault>): Promise<Vault | null> => {
      try {
        const updateData: Partial<ApiVault> = {};
        if (vault.name !== undefined) updateData.Name = vault.name;
        if (vault.description !== undefined) updateData.Description = vault.description;

        const response = await fetch(`${API_BASE_URL}/Vaults/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update vault');
        const data: ApiVault = await response.json();
        return mapApiVaultToVault(data);
      } catch (error) {
        console.error('Error updating vault:', error);
        return null;
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Vaults/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } catch (error) {
        console.error('Error deleting vault:', error);
        return false;
      }
    },
  },

  accounts: {
    getAll: async (): Promise<Account[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Account`);
        if (!response.ok) throw new Error('Failed to fetch accounts');
        const data: ApiAccount[] = await response.json();
        return data.map(mapApiAccountToAccount);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },

    create: async (account: Omit<Account, 'id' | 'createdAt' | 'modifiedAt'>): Promise<Account | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mapAccountToApiAccount(account)),
        });
        if (!response.ok) throw new Error('Failed to create account');
        const data: ApiAccount = await response.json();
        return mapApiAccountToAccount(data);
      } catch (error) {
        console.error('Error creating account:', error);
        return null;
      }
    },

    update: async (id: string, account: Partial<Account>): Promise<Account | null> => {
      try {
        const updateData: Partial<ApiAccount> = {};
        if (account.name !== undefined) updateData.Name = account.name;
        if (account.username !== undefined) updateData.UserId = account.username;
        if (account.password !== undefined) updateData.Password = account.password;
        if (account.url !== undefined) updateData.Url = account.url;
        if (account.notes !== undefined) updateData.Notes = account.notes;
        if (account.vaultId !== undefined) updateData.VaultId = account.vaultId;

        const response = await fetch(`${API_BASE_URL}/Account/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update account');
        const data: ApiAccount = await response.json();
        return mapApiAccountToAccount(data);
      } catch (error) {
        console.error('Error updating account:', error);
        return null;
      }
    },

    delete: async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Account/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } catch (error) {
        console.error('Error deleting account:', error);
        return false;
      }
    },
  },
};
