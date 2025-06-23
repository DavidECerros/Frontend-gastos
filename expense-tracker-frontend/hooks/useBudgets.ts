import { useState, useEffect, useCallback } from 'react';
import { apiService, Budget, CreateBudgetRequest, Expense } from '../services/api';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuestos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addBudget = async (budget: CreateBudgetRequest) => {
    try {
      const newBudget = await apiService.createBudget(budget);
      setBudgets(prev => [newBudget, ...prev]);
      return newBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear presupuesto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBudget = async (id: string, updates: Partial<CreateBudgetRequest>) => {
    try {
      const updatedBudget = await apiService.updateBudget(id, updates);
      setBudgets(prev => 
        prev.map(budget => 
          budget.id === id ? updatedBudget : budget
        )
      );
      return updatedBudget;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar presupuesto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await apiService.deleteBudget(id);
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar presupuesto';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTotalBudgets = () => {
    return budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  const getBudgetWithExpenses = async (budgetId: string) => {
    try {
      const expenses = await apiService.getExpensesByBudget(budgetId);
      const budget = budgets.find(b => b.id === budgetId);
      
      if (!budget) throw new Error('Presupuesto no encontrado');
      
      const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
      const remaining = budget.amount - totalSpent;
      const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
      
      return {
        budget,
        expenses,
        totalSpent,
        remaining,
        percentage,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener presupuesto con gastos';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    loading,
    error,
    loadBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getTotalBudgets,
    getBudgetWithExpenses,
  };
};