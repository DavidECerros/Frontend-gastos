import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useBudgets } from '../hooks/useBudgets';
import { useExpenses } from '../hooks/useExpenses';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { budgets, loading: budgetsLoading, fetchBudgets, getBudgetUsagePercentage } = useBudgets();
  const { expenses, loading: expensesLoading, fetchExpenses, getTotalByBudget } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: signOut }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBudgets(), fetchExpenses()]);
    setRefreshing(false);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalBudgets = () => {
    return budgets.reduce((total, budget) => total + budget.total_amount, 0);
  };

  const getRecentExpenses = () => {
    return expenses.slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (budgetsLoading || expensesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hola, {user?.email?.split('@')[0]}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-HN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={24} color="#1e3a8a" />
            <Text style={styles.summaryAmount}>{formatCurrency(getTotalBudgets())}</Text>
            <Text style={styles.summaryLabel}>Total Presupuestos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="card-outline" size={24} color="#dc2626" />
            <Text style={styles.summaryAmount}>{formatCurrency(getTotalExpenses())}</Text>
            <Text style={styles.summaryLabel}>Total Gastos</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Budget')}
            >
              <Ionicons name="add-circle-outline" size={32} color="#1e3a8a" />
              <Text style={styles.quickActionText}>Crear Presupuesto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                if (budgets.length > 0) {
                  navigation.navigate('AddExpense', { budgetId: budgets[0].id });
                } else {
                  Alert.alert('Sin presupuestos', 'Primero debes crear un presupuesto para agregar gastos.');
                }
              }}
            >
              <Ionicons name="receipt-outline" size={32} color="#1e3a8a" />
              <Text style={styles.quickActionText}>Agregar Gasto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budgets Overview */}
        <View style={styles.budgetsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Presupuestos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {budgets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No tienes presupuestos aún</Text>
              <Text style={styles.emptyStateSubtext}>
                Crea tu primer presupuesto para comenzar a gestionar tus gastos
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('Budget')}
              >
                <Text style={styles.createButtonText}>Crear Presupuesto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            budgets.slice(0, 3).map((budget) => {
              const usagePercentage = getBudgetUsagePercentage(budget);
              const isOverBudget = usagePercentage > 100;
              
              return (
                <TouchableOpacity
                  key={budget.id}
                  style={styles.budgetCard}
                  onPress={() => navigation.navigate('BudgetDetail', { budgetId: budget.id })}
                >
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetName}>{budget.name}</Text>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                  </View>
                  <View style={styles.budgetAmount}>
                    <Text style={styles.budgetSpent}>
                      {formatCurrency(budget.current_amount)}
                    </Text>
                    <Text style={styles.budgetTotal}>
                      de {formatCurrency(budget.total_amount)}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(usagePercentage, 100)}%`,
                          backgroundColor: isOverBudget ? '#dc2626' : '#1e3a8a'
                        }
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.budgetPercentage,
                    { color: isOverBudget ? '#dc2626' : '#1e3a8a' }
                  ]}>
                    {usagePercentage.toFixed(1)}% usado
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Recent Expenses */}
        <View style={styles.expensesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No tienes gastos registrados</Text>
            </View>
          ) : (
            getRecentExpenses().map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseIcon}>
                  <Ionicons name="receipt" size={20} color="#1e3a8a" />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                  <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                </View>
                <Text style={styles.expenseAmount}>
                  -{formatCurrency(expense.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  budgetsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  budgetCategory: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  budgetAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  budgetSpent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  budgetTotal: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  expensesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default DashboardScreen;