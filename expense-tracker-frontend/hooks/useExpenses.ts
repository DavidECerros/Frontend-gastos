import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Expense {
  id: string;
  user_id: string;
  budget_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  budget_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface UpdateExpenseData {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Obtener todos los gastos del usuario
  const fetchExpenses = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener gastos por presupuesto
  const fetchExpensesByBudget = async (budgetId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('budget_id', budgetId)
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo gasto
  const createExpense = async (expenseData: CreateExpenseData): Promise<Expense | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un gasto
  const updateExpense = async (id: string, expenseData: UpdateExpenseData): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...expenseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? data : expense
        )
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un gasto
  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener total de gastos por presupuesto
  const getTotalByBudget = (budgetId: string): number => {
    return expenses
      .filter(expense => expense.budget_id === budgetId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Obtener gastos por categoría
  const getExpensesByCategory = (category: string): Expense[] => {
    return expenses.filter(expense => expense.category === category);
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    fetchExpensesByBudget,
    createExpense,
    updateExpense,
    deleteExpense,
    getTotalByBudget,
    getExpensesByCategory
  };
};