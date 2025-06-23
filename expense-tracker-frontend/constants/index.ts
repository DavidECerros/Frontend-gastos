// API Configuration
export const API_BASE_URL = 'http://192.168.1.100:3000/api'; // Cambia por tu IP local

// Colors (Navy Blue Theme)
export const COLORS = {
  primary: '#1e3a8a',      // Navy Blue
  secondary: '#3b82f6',    // Blue
  accent: '#60a5fa',       // Light Blue
  background: '#f8fafc',   // Light Gray
  surface: '#ffffff',      // White
  text: '#1e293b',         // Dark Gray
  textSecondary: '#64748b', // Gray
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  error: '#dc2626',        // Red
  border: '#e2e8f0',       // Light Gray Border
};

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Hogar',
  'Ropa',
  'Servicios',
  'Otros',
];

// Budget Periods
export const BUDGET_PERIODS = [
  { label: 'Mensual', value: 'monthly' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Anual', value: 'yearly' },
];

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Expense types
export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

// Budget types
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  AddExpense: undefined;
  Expenses: undefined;
  Budget: undefined;
  Loading: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    details?: string;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface ExpenseForm {
  title: string;
  amount: string;
  category: string;
  description: string;
  date: Date;
}

// Statistics types
export interface ExpenseStatistics {
  totalExpenses: number;
  monthlyExpenses: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  dailyAverages: {
    date: string;
    amount: number;
  }[];
}

// Constants
export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Alimentación',
    icon: 'restaurant-outline',
    color: '#10B981'
  },
  {
    id: '2',
    name: 'Transporte',
    icon: 'car-outline',
    color: '#3B82F6'
  },
  {
    id: '3',
    name: 'Entretenimiento',
    icon: 'game-controller-outline',
    color: '#8B5CF6'
  },
  {
    id: '4',
    name: 'Servicios',
    icon: 'receipt-outline',
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Salud',
    icon: 'medical-outline',
    color: '#EF4444'
  },
  {
    id: '6',
    name: 'Educación',
    icon: 'school-outline',
    color: '#06B6D4'
  },
  {
    id: '7',
    name: 'Compras',
    icon: 'bag-outline',
    color: '#EC4899'
  },
  {
    id: '8',
    name: 'Otros',
    icon: 'pricetag-outline',
    color: '#64748B'
  }
];