import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  current_amount: number;
  category: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetData {
  name: string;
  total_amount: number;
  category: string;
  start_date: string;
  end_date: string;
}

export interface UpdateBudgetData {
  name?: string;
  total_amount?: number;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Obtener todos los presupuestos del usuario
  const fetchBudgets = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo presupuesto
  const createBudget = async (budgetData: CreateBudgetData): Promise<Budget | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budgetData,
          user_id: user.id,
          current_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un presupuesto
  const updateBudget = async (id: string, budgetData: UpdateBudgetData): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          ...budgetData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => 
        prev.map(budget => 
          budget.id === id ? data : budget
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

  // Eliminar un presupuesto
  const deleteBudget = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el current_amount de un presupuesto
  const updateCurrentAmount = async (id: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update({
          current_amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setBudgets(prev => 
        prev.map(budget => 
          budget.id === id ? data : budget
        )
      );
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Obtener presupuesto por ID
  const getBudgetById = (id: string): Budget | undefined => {
    return budgets.find(budget => budget.id === id);
  };

  // Obtener presupuestos activos (que no han expirado)
  const getActiveBudgets = (): Budget[] => {
    const now = new Date();
    return budgets.filter(budget => new Date(budget.end_date) >= now);
  };

  // Obtener porcentaje usado del presupuesto
  const getBudgetUsagePercentage = (budget: Budget): number => {
    if (budget.total_amount === 0) return 0;
    return (budget.current_amount / budget.total_amount) * 100;
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    updateCurrentAmount,
    getBudgetById,
    getActiveBudgets,
    getBudgetUsagePercentage
  };
};