import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useExpenses } from '../hooks/useExpenses';
import Loading from '../components/Loading';
import CustomButton from '../components/CustomButton';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

const ExpensesScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  
  // Datos mock mientras conectamos con Supabase
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      title: 'Supermercado',
      amount: 150.50,
      category: 'Alimentación',
      date: '2024-01-15',
      description: 'Compras semanales'
    },
    {
      id: '2',
      title: 'Gasolina',
      amount: 75.00,
      category: 'Transporte',
      date: '2024-01-14',
      description: 'Llenado de tanque'
    },
    {
      id: '3',
      title: 'Cena restaurante',
      amount: 85.25,
      category: 'Entretenimiento',
      date: '2024-01-13',
      description: 'Cena con amigos'
    },
    {
      id: '4',
      title: 'Factura luz',
      amount: 120.00,
      category: 'Servicios',
      date: '2024-01-12',
      description: 'Pago mensual electricidad'
    },
    {
      id: '5',
      title: 'Medicamentos',
      amount: 45.75,
      category: 'Salud',
      date: '2024-01-11',
      description: 'Compra en farmacia'
    }
  ]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const onRefresh = () => {
    setRefreshing(true);
    // Simular carga
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Estás seguro de que quieres eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setExpenses(prev => prev.filter(expense => expense.id !== id));
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'alimentación':
        return 'restaurant-outline';
      case 'transporte':
        return 'car-outline';
      case 'entretenimiento':
        return 'game-controller-outline';
      case 'servicios':
        return 'receipt-outline';
      case 'salud':
        return 'medical-outline';
      default:
        return 'pricetag-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getCategoryIcon(item.category) as any} 
              size={24} 
              color="#1E3A8A" 
            />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseTitle}>{item.title}</Text>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.expenseActions}>
          <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteExpense(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.description && (
        <Text style={styles.expenseDescription}>{item.description}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Gastos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense' as never)}
        >
          <Ionicons name="add" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      {/* Total Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total de Gastos</Text>
        <Text style={styles.summaryAmount}>-${totalExpenses.toFixed(2)}</Text>
        <Text style={styles.summaryCount}>{expenses.length} gastos registrados</Text>
      </View>

      {/* Expenses List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
            <Text style={styles.emptySubtitle}>
              Comienza agregando tu primer gasto
            </Text>
            <CustomButton
              title="Agregar Primer Gasto"
              onPress={() => navigation.navigate('AddExpense' as never)}
              style={styles.emptyButton}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
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
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
});

export default ExpensesScreen;