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