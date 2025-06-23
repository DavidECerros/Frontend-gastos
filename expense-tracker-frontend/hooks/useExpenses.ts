import { useState, useEffect, useCallback } from 'react';
import { apiService, Expense, CreateExpenseRequest } from '../services/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = async (expense: CreateExpenseRequest) => {
    try {
      const newExpense = await apiService.createExpense(expense);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear gasto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateExpense = async (id: string, updates: Partial<CreateExpenseRequest>) => {
    try {
      const updatedExpense = await apiService.updateExpense(id, updates);
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? updatedExpense : expense
        )
      );
      return updatedExpense;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar gasto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await apiService.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar gasto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total
    }));
  };

  const getRecentExpenses = (limit: number = 5) => {
    return expenses.slice(0, limit);
  };

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getRecentExpenses,
  };
};