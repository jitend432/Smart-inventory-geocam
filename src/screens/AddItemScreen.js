import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addItem } from '../redux/slices/itemSlice';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { COLORS, SPACING } from '../constants/theme';
import { validateItem } from '../utils/validation';

const AddItemScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    const validationErrors = validateItem(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    // Simulate async operation
    setTimeout(() => {
      dispatch(addItem({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        price: parseFloat(formData.price),
      }));
      setLoading(false);
      Alert.alert('Success', 'Item added successfully!');
      navigation.goBack();
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Add New Item" showBack onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <Input
            label="Item Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter item name"
            error={errors.name}
            required
          />
          
          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Enter item description"
            multiline
            numberOfLines={3}
            error={errors.description}
          />
          
          <Input
            label="Quantity"
            value={formData.quantity}
            onChangeText={(value) => handleChange('quantity', value)}
            placeholder="Enter quantity"
            keyboardType="numeric"
            error={errors.quantity}
            required
          />
          
          <Input
            label="Price"
            value={formData.price}
            onChangeText={(value) => handleChange('price', value)}
            placeholder="Enter price"
            keyboardType="decimal-pad"
            error={errors.price}
            required
          />
          
          <Button
            title="Save Item"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: SPACING.lg,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default AddItemScreen;