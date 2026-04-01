export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  role: 'user' | 'admin';
}

interface MockAccount {
  username: string;
  password: string;
  user: AuthUser;
}

export const MOCK_ADMIN_ACCOUNT: MockAccount = {
  username: 'admin',
  password: 'admin123',
  user: {
    id: 'admin-1',
    name: 'FNIS Admin',
    email: 'admin@fnis.com',
    age: 0,
    weight: 0,
    height: 0,
    goal: 'Manage platform operations',
    role: 'admin',
  },
};

export const MOCK_USER_ACCOUNT: MockAccount = {
  username: 'alex',
  password: 'user123',
  user: {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    age: 28,
    weight: 75,
    height: 178,
    goal: 'Build Muscle',
    role: 'user',
  },
};

export const MOCK_AUTH_ACCOUNTS = [MOCK_ADMIN_ACCOUNT, MOCK_USER_ACCOUNT];