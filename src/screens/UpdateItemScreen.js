import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateItem } from '../redux/slices/itemSlice';
import Header from '../components/common/Header';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { COLORS, SPACING } from '../constants/theme';
import { validateItem } from '../utils/validation';

const UpdateItemScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { item } = route.params;
  
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    quantity: item.quantity.toString(),
    price: item.price.toString(),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Update header title
    navigation.setOptions({
      title: `Edit ${item.name}`,
    });
  }, [navigation, item]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdate = () => {
    const validationErrors = validateItem(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      dispatch(updateItem({
        id: item.id,
        updatedData: {
          ...formData,
          quantity: parseInt(formData.quantity, 10),
          price: parseFloat(formData.price),
        },
      }));
      setLoading(false);
      Alert.alert('Success', 'Item updated successfully!');
      navigation.goBack();
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Update Item" showBack onBack={() => navigation.goBack()} />
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
            title="Update Item"
            onPress={handleUpdate}
            loading={loading}
            style={styles.updateButton}
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
  updateButton: {
    marginTop: SPACING.lg,
  },
});

export default UpdateItemScreen;