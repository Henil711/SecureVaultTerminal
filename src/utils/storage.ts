import { Vault, Account, UserProfile } from '../types';

const VAULTS_KEY = 'passwordmanager_vaults';
const ACCOUNTS_KEY = 'passwordmanager_accounts';
const PROFILE_KEY = 'passwordmanager_profile';

export const storage = {
  getVaults: (): Vault[] => {
    const data = localStorage.getItem(VAULTS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((v: Vault) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      modifiedAt: new Date(v.modifiedAt),
    }));
  },

  saveVaults: (vaults: Vault[]): void => {
    localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  },

  getAccounts: (): Account[] => {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((a: Account) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      modifiedAt: new Date(a.modifiedAt),
    }));
  },

  saveAccounts: (accounts: Account[]): void => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      return {
        username: 'user',
        email: 'user@passwordmanager.local',
        theme: 'green',
      };
    }
    return JSON.parse(data);
  },

  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },
};
