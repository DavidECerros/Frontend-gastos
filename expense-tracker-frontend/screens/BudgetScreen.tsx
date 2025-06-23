import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

interface BudgetCategory {
  id: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  icon: string;
  color: string;
}

const BudgetScreen: React.FC = () => {
  const navigation = useNavigation();
  const [totalBudget, setTotalBudget] = useState('2500.00');
  const [isEditing, setIsEditing] = useState(false);

  // Datos mock de presupuesto por categorías
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Alimentación',
      budgetAmount: 600,
      spentAmount: 450.75,
      icon: 'restaurant-outline',
      color: '#10B981'
    },
    {
      id: '2',
      name: 'Transporte',
      budgetAmount: 300,
      spentAmount: 225.00,
      icon: 'car-outline',
      color: '#3B82F6'
    },
    {
      id: '3',
      name: 'Entretenimiento',
      budgetAmount: 200,
      spentAmount: 185.25,
      icon: 'game-controller-outline',
      color: '#8B5CF6'
    },
    {
      id: '4',
      name: 'Servicios',
      budgetAmount: 400,
      spentAmount: 320.00,
      icon: 'receipt-outline',
      color: '#F59E0B'
    },
    {
      id: '5',
      name: 'Salud',
      budgetAmount: 150,
      spentAmount: 45.75,
      icon: 'medical-outline',
      color: '#EF4444'
    }
  ]);

  const totalBudgetAmount = budgetCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpentAmount = budgetCategories.reduce((sum, cat) => sum + cat.spentAmount, 0);
  const remainingBudget = totalBudgetAmount - totalSpentAmount;
  const budgetUsedPercentage = (totalSpentAmount / totalBudgetAmount) * 100;

  const handleSaveBudget = () => {
    setIsEditing(false);
    Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
  };

  const handleEditCategory = (categoryId: string, newAmount: number) => {
    setBudgetCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, budgetAmount: newAmount }
          : cat
      )
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return '#10B981';
    if (percentage < 80) return '#F59E0B';
    return '#EF4444';
  };

  const renderBudgetCategory = (category: BudgetCategory) => {
    const percentage = (category.spentAmount / category.budgetAmount) * 100;
    const remaining = category.budgetAmount - category.spentAmount;

    return (
      <View key={category.id} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon as any} size={24} color={category.color} />
            </View>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryBudget}>
                Presupuesto: ${category.budgetAmount.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor(percentage)
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {percentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.categoryFooter}>
          <View style={styles.amountInfo}>
            <Text style={styles.spentAmount}>
              Gastado: ${category.spentAmount.toFixed(2)}
            </Text>
            <Text style={[
              styles.remainingAmount,
              { color: remaining >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {remaining >= 0 ? 'Disponible' : 'Excedido'}: ${Math.abs(remaining).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Presupuesto</Text>
        <TouchableOpacity
          style={styles.editHeaderButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "pencil-outline"} 
            size={24} 
            color="#1E3A8A" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Resumen del Presupuesto</Text>
          
          <View style={styles.budgetSummary}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Presupuesto Total</Text>
              <Text style={styles.budgetValue}>${totalBudgetAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Total Gastado</Text>
              <Text style={[styles.budgetValue, { color: '#EF4444' }]}>
                ${totalSpentAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Disponible</Text>
              <Text style={[
                styles.budgetValue, 
                { color: remainingBudget >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                ${remainingBudget.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Overall Progress */}
          <View style={styles.overallProgress}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(budgetUsedPercentage, 100)}%`,
                      backgroundColor: getProgressColor(budgetUsedPercentage)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {budgetUsedPercentage.toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.progressLabel}>
              {budgetUsedPercentage > 100 ? 'Presupuesto excedido' : 'del presupuesto utilizado'}
            </Text>
          </View>
        </View>

        {/* Categories Budget */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Presupuesto por Categorías</Text>
          
          {budgetCategories.map(renderBudgetCategory)}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <CustomButton
            title="Agregar Nueva Categoría"
            onPress={() => {
              Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto');
            }}
            style={styles.actionButton}
            variant="outline"
          />
          
          <CustomButton
            title="Ver Historial de Gastos"
            onPress={() => navigation.navigate('Expenses' as never)}
            style={styles.actionButton}
          />
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
  editHeaderButton: {
    padding: 8,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
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
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  overallProgress: {
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 40,
    textAlign: 'right',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  categoryBudget: {
    fontSize: 14,
    color: '#64748B',
  },
  editButton: {
    padding: 8,
  },
  categoryFooter: {
    marginTop: 12,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentAmount: {
    fontSize: 14,
    color: '#EF4444',
  },
  remainingAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default BudgetScreen;