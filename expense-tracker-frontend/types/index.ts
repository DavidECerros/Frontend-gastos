export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  budget_id?: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at?: string;
  budgets?: {
    id: string;
    name: string;
  };
}

export interface AuthData {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  first_name: string;
  last_name: string;
}

export interface ExpenseStats {
  totalAmount: number;
  totalExpenses: number;
  categoryStats: Record<string, number>;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  budget?: Budget;
  budgets?: Budget[];
  expense?: Expense;
  expenses?: Expense[];
  error?: string;
}