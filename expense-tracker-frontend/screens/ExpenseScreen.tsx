import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useExpenses, Expense } from '../hooks/useExpenses';
import { useBudgets } from '../hooks/useBudgets';

type ExpensesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Expenses'>;

interface Props {
  navigation: ExpensesScreenNavigationProp;
}

const ExpensesScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    expenses, 
    loading, 
    fetchExpenses, 
    deleteExpense 
  } = useExpenses();
  const { budgets, getBudgetById } = useBudgets();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm]);

  const filterExpenses = () => {
    if (!searchTerm.trim()) {
      setFilteredExpenses(expenses);
      return;
    }

    const filtered = expenses.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Eliminar Gasto',
      `¿Estás seguro de que quieres eliminar "${expense.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteExpense(expense.id);
            if (!success) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          }
        }
      ]
    );
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

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Alimentación': 'restaurant',
      'Transporte': 'car',
      'Entretenimiento': 'game-controller',
      'Salud': 'medical',
      'Educación': 'school',
      'Ropa': 'shirt',
      'Hogar': 'home',
      'Servicios': 'build',
      'Otros': 'ellipsis-horizontal'
    };
    return icons[category] || 'receipt';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const budget = getBudgetById(item.budget_id);
    
    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}
      >
        <View style={styles.expenseIcon}>
          <Ionicons 
            name={getCategoryIcon(item.category) as any} 
            size={20} 
            color="#1e3a8a" 
          />
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <View style={styles.expenseMetadata}>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text style={styles.expenseBudget}>
              {budget ? budget.name : 'Presupuesto eliminado'}
            </Text>
          </View>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.expenseActions}>
          <Text style={styles.expenseAmount}>
            -{formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteExpense(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar gastos..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total de gastos</Text>
        <Text style={styles.summaryAmount}>
          {formatCurrency(getTotalExpenses())}
        </Text>
        <Text style={styles.summaryCount}>
          {filteredExpenses.length} {filteredExpenses.length === 1 ? 'gasto' : 'gastos'}
        </Text>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyStateTitle}>
        {searchTerm ? 'No se encontraron gastos' : 'No tienes gastos registrados'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchTerm 
          ? 'Intenta con otros términos de búsqueda'
          : 'Agrega tu primer gasto para comenzar a hacer seguimiento'
        }
      </Text>
      {!searchTerm && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (budgets.length > 0) {
              navigation.navigate('AddExpense', { budgetId: budgets[0].id });
            } else {
              Alert.alert('Sin presupuestos', 'Primero debes crear un presupuesto para agregar gastos.');
            }
          }}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Agregar Gasto</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && expenses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.title}>Mis Gastos</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando gastos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Gastos</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => {
            if (budgets.length > 0) {
              navigation.navigate('AddExpense', { budgetId: budgets[0].id });
            } else {
              Alert.alert('Sin presupuestos', 'Primero debes crear un presupuesto para agregar gastos.');
            }
          }}
        >
          <Ionicons name="add" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  addHeaderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  placeholder: {
    width: 40,
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
  listContent: {
    flexGrow: 1,
  },
  listHeader: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },