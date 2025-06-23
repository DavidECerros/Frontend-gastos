import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface BudgetFormData {
  name: string;
  amount: string;
  description: string;
}

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onBudgetAdded: () => void;
}

const budgetSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  amount: yup
    .string()
    .required('El monto es requerido')
    .matches(/^\d+(\.\d{1,2})?$/, 'Ingresa un monto válido')
    .test('min-amount', 'El monto debe ser mayor a 0', (value) => {
      return value ? parseFloat(value) > 0 : false;
    }),
  description: yup
    .string()
    .max(200, 'La descripción no puede tener más de 200 caracteres'),
});

export default function AddBudgetModal({
  visible,
  onClose,
  onBudgetAdded,
}: AddBudgetModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: yupResolver(budgetSchema),
    defaultValues: {
      name: '',
      amount: '',
      description: '',
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      setLoading(true);

      const { error } = await supabase.from('budgets').insert([
        {
          name: data.name,
          amount: parseFloat(data.amount),
          description: data.description || null,
          user_id: user?.id,
          active: true,
        },
      ]);

      if (error) throw error;

      Alert.alert('Éxito', 'Presupuesto creado correctamente');
      reset();
      onBudgetAdded();
      onClose();
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'No se pudo crear el presupuesto');
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
          <Text style={styles.title}>Nuevo Presupuesto</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1e3a8a" />
            ) : (
              <Text style={styles.saveButton}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Presupuesto</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Ej: Gastos del mes"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor="#64748b"
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Monto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto del Presupuesto</Text>
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

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción (Opcional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  placeholder="Describe el propósito de este presupuesto..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#64748b"
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>💡 Consejos para tu presupuesto:</Text>
            <Text style={styles.infoText}>
              • Sé realista con el monto que asignes
            </Text>
            <Text style={styles.infoText}>
              • Considera todos los gastos posibles
            </Text>
            <Text style={styles.infoText}>
              • Revisa y ajusta tu presupuesto regularmente
            </Text>
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 4,
    lineHeight: 20,
  },
});