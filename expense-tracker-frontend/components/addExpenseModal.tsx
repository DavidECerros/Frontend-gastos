import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Budget {
  id: string;
  name: string;
  amount: number;
}

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  budget_id: string;
}

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const expenseSchema = yup.object().shape({
  description: yup
    .string()
    .required('La descripción es requerida')
    .min(3, 'La descripción debe tener al menos 3 caracteres'),
  amount: yup
    .string()
    .required('El monto es requerido')
    .matches(/^\d+(\.\d{1,2})?$/, 'Ingresa un monto válido'),
  category: yup.string().required('La categoría es requerida'),
  budget_id: yup.string().required('Debes seleccionar un presupuesto'),
});

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Compras',
  'Servicios',
  'Otros',
];

export default function AddExpenseModal({
  visible,
  onClose,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: '',
      category: '',
      budget_id: '',
    },
  });

  useEffect(() => {
    if (visible) {
      fetchBudgets();
    }
  }, [visible]);

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('id, name, amount')
        .eq('user_id', user?.id)
        .eq('active', true);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'No se pudieron cargar los presupuestos');
    } finally {
      setLoadingBudgets(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.from('expenses').insert([
        {
          description: data.description,
          amount: parseFloat(data.amount),
          category: data.category,
          budget_id: data.budget_id,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      Alert.alert('Éxito', 'Gasto agregado correctamente');
      reset();
      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'No se pudo agregar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Agregar Gasto</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1e3a8a" />
            ) : (
              <Text style={styles.saveButton}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.description && styles.inputError]}
                  placeholder="Ej: Almuerzo en restaurante"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor="#64748b"
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </View>

          {/* Monto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#64748b"
                />
              )}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
          </View>

          {/* Categoría */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoría</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.pickerWrapper, errors.category && styles.pickerError]}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona una categoría" value="" />
                    {categories.map((category) => (
                      <Picker.Item key={category} label={category} value={category} />
                    ))}
                  </Picker>
                </View>
              )}
            />
            {errors.category && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}
          </View>

          {/* Presupuesto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Presupuesto</Text>
            {loadingBudgets ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1e3a8a" />
                <Text style={styles.loadingText}>Cargando presupuestos...</Text>
              </View>
            ) : budgets.length === 0 ? (
              <View style={styles.noBudgetsContainer}>
                <Text style={styles.noBudgetsText}>
                  No tienes presupuestos activos. Crea uno primero.
                </Text>
              </View>
            ) : (
              <Controller
                control={control}
                name="budget_id"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.pickerWrapper, errors.budget_id && styles.pickerError]}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecciona un presupuesto" value="" />
                      {budgets.map((budget) => (
                        <Picker.Item 
                          key={budget.id} 
                          label={`${budget.name} - $${budget.amount.toFixed(2)}`} 
                          value={budget.id} 
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            )}
            {errors.budget_id && (
              <Text style={styles.errorText}>{errors.budget_id.message}</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  saveButton: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  pickerWrapper: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: '#ef4444',
  },
  picker: {
    height: 50,
    color: '#1f2937',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  noBudgetsContainer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  noBudgetsText: {
    color: '#92400e',
    fontSize: 14,
    textAlign: 'center',
  },
});