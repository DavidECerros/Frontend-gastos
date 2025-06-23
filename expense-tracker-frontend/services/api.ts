import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Budget, 
  Expense, 
  ExpenseStats,
  ApiResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejo de errores
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado, limpiar almacenamiento
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: LoginRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  // User methods
  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put('/user/profile', data);
    return response.data;
  }

  // Budget methods
  async createBudget(data: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/budgets', data);
    return response.data;
  }

  async getBudgets(): Promise<{ budgets: Budget[] }> {
    const response: AxiosResponse<{ budgets: Budget[] }> = await this.api.get('/budgets');
    return response.data;
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(`/budgets/${id}`, data);
    return response.data;
  }

  async deleteBudget(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/budgets/${id}`);
    return response.data;
  }

  // Expense methods
  async createExpense(data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/expenses', data);
    return response.data;
  }

  async getExpenses(budgetId?: string): Promise<{ expenses: Expense[] }> {
    const params = budgetId ? { budget_id: budgetId } : {};
    const response: AxiosResponse<{ expenses: Expense[] }> = await this.api.get('/expenses', { params });
    return response.data;
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(`/expenses/${id}`, data);
    return response.data;
  }

  async deleteExpense(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/expenses/${id}`);
    return response.data;
  }

  async getExpenseStats(): Promise<ExpenseStats> {
    const response: AxiosResponse<ExpenseStats> = await this.api.get('/expenses/stats');
    return response.data;
  }
}

export const apiService = new ApiService();