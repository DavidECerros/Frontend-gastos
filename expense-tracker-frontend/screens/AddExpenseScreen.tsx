import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useExpenses } from '../hooks/useExpenses';
import { useBudgets } from '../hooks/useBudgets';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

interface Props {
  navigation: AddExpenseScreenNavigationProp;
  route: AddExpenseScreenRouteProp;
}

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Ropa',
  'Hogar',
  'Servicios',
  'Otros'
];

const AddExpenseScreen: React.FC<Props> = ({ navigation, route }) => {
  const { budgetId } = route.params;
  const { createExpense, loading } = useExpenses();
  const { budgets, getBudgetById } = useBudgets();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBudgetId, setSelectedBudgetId] = useState(budgetId || '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const selectedBudget = getBudgetById(selectedBudgetId);

  const handleSubmit = async () => {
    if (!amount || !description || !category || !selectedBudgetId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const success = await createExpense({
      budget_id: selectedBudgetId,
      amount: numericAmount,
      description,
      category,
      date
    });

    if (success) {
      Alert.alert(
        'Éxito',
        'Gasto agregado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      Alert.alert('Error', 'No se pudo agregar el gasto');
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue === '') return '';
    
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('es-HN').format(number);
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^\d]/g, '');
    setAmount(numericValue);
  };

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  category === item && styles.selectedCategoryOption
                ]}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  category === item && styles.selectedCategoryOptionText
                ]}>
                  {item}
                </Text>
                {category === item && (
                  <Ionicons name="checkmark" size={20} color="#1e3a8a" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const BudgetModal = () => (
    <Modal
      visible={showBudgetModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBudgetModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Presupuesto</Text>
            <TouchableOpacity
              onPress={() => setShowBudgetModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={budgets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.budgetOption,
                  selectedBudgetId === item.id && styles.selectedBudgetOption
                ]}
                onPress={() => {
                  setSelectedBudgetId(item.id);
                  setShowBudgetModal(false);
                }}
              >
                <View style={styles.budgetOptionContent}>
                  <Text style={[
                    styles.budgetOptionText,
                    selectedBudgetId === item.id && styles.selectedBudgetOptionText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.budgetOptionCategory}>
                    {item.category}
                  </Text>
                </View>
                {selectedBudgetId === item.id && (
                  <Ionicons name="checkmark" size={20} color="#1e3a8a" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Gasto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Presupuesto</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowBudgetModal(true)}
          >
            <Text style={[
              styles.selectorText,
              !selectedBudget && styles.placeholderText
            ]}>
              {selectedBudget ? selectedBudget.name : 'Selecciona un presupuesto'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Monto</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>L</Text>
            <TextInput
              style={styles.amountInput}
              value={formatCurrency(amount)}
              onChangeText={handleAmountChange}
              placeholder="0"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Almuerzo en restaurante"
            maxLength={100}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[
              styles.selectorText,
              !category && styles.placeholderText
            ]}>
              {category || 'Selecciona una categoría'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Agregar Gasto</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <CategoryModal />
      <BudgetModal />
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedCategoryOption: {
    backgroundColor: '#f1f5f9',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedCategoryOptionText: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  budgetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedBudgetOption: {
    backgroundColor: '#f1f5f9',
  },
  budgetOptionContent: {
    flex: 1,
  },
  budgetOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedBudgetOptionText: {
    color: '#1e3a8a',
  },
  budgetOptionCategory: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});

export default AddExpenseScreen;