export interface Account {
  id: string;
  vaultId: string;
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface Vault {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface UserProfile {
  username: string;
  email: string;
  theme: 'green' | 'white' | 'amber';
}

export type View = 'overview' | 'vaults' | 'accounts' | 'profile';
