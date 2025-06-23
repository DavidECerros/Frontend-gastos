import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AddExpenseModal from '../components/AddExpenseModal';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  created_at: string;
  budget: {
    name: string;
  };
}

interface DashboardData {
  totalBudget: number;
  totalSpent: number;
  activeBudgets: number;
  recentExpenses: Expense[];
  budgets: Budget[];
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalBudget: 0,
    totalSpent: 0,
    activeBudgets: 0,
    recentExpenses: [],
    budgets: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Obtener presupuestos con sus gastos
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          id,
          name,
          amount,
          active,
          expenses(amount)
        `)
        .eq('user_id', user?.id);

      if (budgetsError) throw budgetsError;

      // Obtener gastos recientes
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          category,
          created_at,
          budgets(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (expensesError) throw expensesError;

      // Procesar datos
      const activeBudgets = budgetsData?.filter(b => b.active) || [];
      const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = activeBudgets.reduce((sum, budget) => {
        const spent = budget.expenses?.reduce((expenseSum: number, expense: any) => expenseSum + expense.amount, 0) || 0;
        return sum + spent;
      }, 0);

      const budgetsWithSpent = activeBudgets.map(budget => ({
        ...budget,
        spent: budget.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0,
      }));

      const recentExpenses = expensesData?.map(expense => ({
        ...expense,
        budget: expense.budgets,
      })) || [];

      setData({
        totalBudget,
        totalSpent,
        activeBudgets: activeBudgets.length,
        recentExpenses,
        budgets: budgetsWithSpent,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: signOut },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Alimentación': 'restaurant-outline',
      'Transporte': 'car-outline',
      'Entretenimiento': 'game-controller-outline',
      'Salud': 'medical-outline',
      'Educación': 'school-outline',
      'Compras': 'bag-outline',
      'Servicios': 'construct-outline',
      'Otros': 'ellipsis-horizontal-outline',
    };
    return icons[category] || 'ellipsis-horizontal-outline';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseIcon}>
        <Ionicons
          name={getCategoryIcon(item.category) as any}
          size={20}
          color="#1e3a8a"
        />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseCategory}>
          {item.category} • {item.budget?.name}
        </Text>
        <Text style={styles.expenseDate}>
          {new Date(item.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
    </View>
  );

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const percentage = (item.spent / item.amount) * 100;
    const isOverBudget = percentage > 100;
    
    return (
      <View style={styles.budgetItem}>
        <Text style={styles.budgetName}>{item.name}</Text>
        <View style={styles.budgetProgress}>
          <View style={styles.budgetProgressBar}>
            <View
              style={[
                styles.budgetProgressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981',
                },
              ]}
            />
          </View>
          <Text style={[styles.budgetPercentage, isOverBudget && { color: '#ef4444' }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.budgetAmounts}>
          <Text style={styles.budgetSpent}>${item.spent.toFixed(2)}</Text>
          <Text style={styles.budgetTotal}>/ ${item.amount.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  const remainingBudget = data.totalBudget - data.totalSpent;
  const spentPercentage = data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.userName}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen General */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Presupuesto Total</Text>
              <Text style={styles.summaryAmount}>${data.totalBudget.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Gastado</Text>
              <Text style={[styles.summaryAmount, { color: '#ef4444' }]}>
                ${data.totalSpent.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Disponible</Text>
              <Text
                style={[
                  styles.summaryAmount,
                  { color: remainingBudget >= 0 ? '#10b981' : '#ef4444' },
                ]}
              >
                ${remainingBudget.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Presupuestos Activos</Text>
              <Text style={styles.summaryAmount}>{data.activeBudgets}</Text>
            </View>
          </View>
        </View>

        {/* Progress General */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progreso General</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(spentPercentage, 100)}%`,
                    backgroundColor: spentPercentage > 100 ? '#ef4444' : spentPercentage > 80 ? '#f59e0b' : '#10b981',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{spentPercentage.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Presupuestos Activos */}
        {data.budgets.length > 0 && (
          <View style={styles.budgetsSection}>
            <Text style={styles.sectionTitle}>Presupuestos Activos</Text>
            <FlatList
              data={data.budgets}
              renderItem={renderBudgetItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Gastos Recientes */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Gastos Recientes</Text>
          {data.recentExpenses.length === 0 ? (
            <View style={styles.noExpensesContainer}>
              <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              <Text style={styles.noExpensesText}>No hay gastos registrados</Text>
              <Text style={styles.noExpensesSubtext}>
                Agrega tu primer gasto para empezar a trackear
              </Text>
            </View>
          ) : (
            <FlatList
              data={data.recentExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onExpenseAdded={() => {
          setModalVisible(false);
          fetchDashboardData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e3a8a',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  signOutButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 50,
  },
  budgetsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  budgetItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  budgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginRight: 8,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    minWidth: 35,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  budgetTotal: {
    fontSize: 14,
    color: '#64748b',
  },
  expensesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  noExpensesContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noExpensesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
  },
  noExpensesSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});