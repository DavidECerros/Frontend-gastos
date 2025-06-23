import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

interface QuickStat {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

interface RecentExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  icon: string;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - Replace with real data from Supabase later
  const [quickStats] = useState<QuickStat[]>([
    {
      id: '1',
      title: 'Balance Total',
      value: '$2,274.25',
      icon: 'wallet-outline',
      color: '#10B981',
      change: '+5.2%',
      changeType: 'increase'
    },
    {
      id: '2',
      title: 'Gastos del Mes',
      value: '$1,226.75',
      icon: 'trending-down-outline',
      color: '#EF4444',
      change: '+12.3%',
      changeType: 'increase'
    },
    {
      id: '3',
      title: 'Presupuesto',
      value: '$2,500.00',
      icon: 'pie-chart-outline',
      color: '#3B82F6',
      change: '51% usado',
      changeType: 'decrease'
    },
    {
      id: '4',
      title: 'Ahorros',
      value: '$847.50',
      icon: 'trending-up-outline',
      color: '#8B5CF6',
      change: '+8.7%',
      changeType: 'increase'
    }
  ]);

  const [recentExpenses] = useState<RecentExpense[]>([
    {
      id: '1',
      title: 'Supermercado Walmart',
      amount: 85.50,
      category: 'Alimentación',
      date: '2024-01-15',
      icon: 'restaurant-outline'
    },
    {
      id: '2',
      title: 'Gasolina Shell',
      amount: 45.00,
      category: 'Transporte',
      date: '2024-01-14',
      icon: 'car-outline'
    },
    {
      id: '3',
      title: 'Netflix',
      amount: 15.99,
      category: 'Entretenimiento',
      date: '2024-01-13',
      icon: 'play-outline'
    }
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleLogout = () => {
    signOut();
  };

  const quickActions = [
    {
      id: '1',
      title: 'Agregar Gasto',
      icon: 'add-circle-outline',
      color: '#EF4444',
      onPress: () => navigation.navigate('AddExpense' as never)
    },
    {
      id: '2',
      title: 'Ver Gastos',
      icon: 'receipt-outline',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Expenses' as never)
    },
    {
      id: '3',
      title: 'Presupuesto',
      icon: 'pie-chart-outline',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('Budget' as never)
    },
    {
      id: '4',
      title: 'Reportes',
      icon: 'bar-chart-outline',
      color: '#10B981',
      onPress: () => {
        // TODO: Navigate to reports screen
        console.log('Navigate to reports');
      }
    }
  ];

  const renderQuickStat = (stat: QuickStat) => (
    <View key={stat.id} style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
          <Ionicons name={stat.icon as any} size={24} color={stat.color} />
        </View>
        {stat.change && (
          <View style={[
            styles.changeIndicator,
            { backgroundColor: stat.changeType === 'increase' ? '#10B98120' : '#EF444420' }
          ]}>
            <Ionicons 
              name={stat.changeType === 'increase' ? 'arrow-up' : 'arrow-down'} 
              size={12} 
              color={stat.changeType === 'increase' ? '#10B981' : '#EF4444'} 
            />
            <Text style={[
              styles.changeText,
              { color: stat.changeType === 'increase' ? '#10B981' : '#EF4444' }
            ]}>
              {stat.change}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  const renderRecentExpense = (expense: RecentExpense) => (
    <TouchableOpacity key={expense.id} style={styles.expenseItem}>
      <View style={styles.expenseIcon}>
        <Ionicons name={expense.icon as any} size={20} color="#1E3A8A" />
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseTitle}>{expense.title}</Text>
        <Text style={styles.expenseCategory}>{expense.category}</Text>
      </View>
      <View style={styles.expenseAmount}>
        <Text style={styles.expenseValue}>-${expense.amount.toFixed(2)}</Text>
        <Text style={styles.expenseDate}>
          {new Date(expense.date).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any) => (
    <TouchableOpacity 
      key={action.id} 
      style={styles.actionButton}
      onPress={action.onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.userName}>{user?.email || 'Usuario'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Ionicons name="person-outline" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Financiero</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            {quickStats.map(renderQuickStat)}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses' as never)}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentExpensesContainer}>
            {recentExpenses.map(renderRecentExpense)}
          </View>
        </View>

        {/* Monthly Summary Card */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de Enero</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ingresos</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>+$3,500.00</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Gastos</Text>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-$1,226.75</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryValue, { color: '#1E293B', fontWeight: 'bold' }]}>
                  $2,273.25
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  statsContainer: {
    paddingRight: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
  },
  recentExpensesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#64748B',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
});

export default DashboardScreen;