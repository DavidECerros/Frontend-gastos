import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AddBudgetModal from '../components/AddBudgetModal';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  active: boolean;
  created_at: string;
}

export default function BudgetScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          name,
          amount,
          active,
          created_at,
          expenses!inner(amount)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const budgetsWithSpent = data?.map(budget => ({
        ...budget,
        spent: budget.expenses?.reduce((total: number, expense: any) => total + expense.amount, 0) || 0,
      })) || [];

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'No se pudieron cargar los presupuestos');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchBudgets();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleToggleBudget = async (budgetId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ active: !currentStatus })
        .eq('id', budgetId);

      if (error) throw error;

      Alert.alert(
        'Éxito',
        `Presupuesto ${!currentStatus ? 'activado' : 'desactivado'} correctamente`
      );
      await fetchBudgets();
    } catch (error) {
      console.error('Error toggling budget:', error);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto');
    }
  };

  const handleDeleteBudget = async (budgetId: string, budgetName: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el presupuesto "${budgetName}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', budgetId);

              if (error) throw error;

              Alert.alert('Éxito', 'Presupuesto eliminado correctamente');
              await fetchBudgets();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'No se pudo eliminar el presupuesto');
            }
          },
        },
      ]
    );
  };

  const getProgressPercentage = (spent: number, amount: number) => {
    return Math.min((spent / amount) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return '#10b981';
    if (percentage < 80) return '#f59e0b';
    return '#ef4444';
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => {
    const progressPercentage = getProgressPercentage(item.spent, item.amount);
    const progressColor = getProgressColor(progressPercentage);
    const remaining = item.amount - item.spent;

    return (
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetName}>{item.name}</Text>
            <Text style={styles.budgetAmount}>
              ${item.amount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetActions}>
            <TouchableOpacity
              onPress={() => handleToggleBudget(item.id, item.active)}
              style={[
                styles.actionButton,
                { backgroundColor: item.active ? '#10b981' : '#64748b' },
              ]}
            >
              <Ionicons
                name={item.active ? 'checkmark' : 'pause'}
                size={16}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteBudget(item.id, item.name)}
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            >
              <Ionicons name="trash-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progressPercentage.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.budgetDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gastado</Text>
            <Text style={[styles.detailValue, { color: '#ef4444' }]}>
              ${item.spent.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Restante</Text>
            <Text
              style={[
                styles.detailValue,
                { color: remaining >= 0 ? '#10b981' : '#ef4444' },
              ]}
            >
              ${remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.active ? '#dcfce7' : '#f1f5f9',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.active ? '#16a34a' : '#64748b' },
              ]}
            >
              {item.active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Cargando presupuestos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Presupuestos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No tienes presupuestos</Text>
          <Text style={styles.emptySubtitle}>
            Crea tu primer presupuesto para empezar a controlar tus gastos
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>Crear Presupuesto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddBudgetModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onBudgetAdded={() => {
          setModalVisible(false);
          fetchBudgets();
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 16,
    color: '#64748b',
  },
  budgetActions: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    minWidth: 40,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});