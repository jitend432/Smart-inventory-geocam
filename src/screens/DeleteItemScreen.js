import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../redux/hooks';
import { deleteItem } from '../redux/slices/itemSlice';
import Header from '../components/common/Header';
import ItemCard from '../components/ItemCard';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeleteItemScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const items = useAppSelector(state => state.items.items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeletePress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteItem(selectedItem.id));
      Alert.alert('Success', 'Item deleted successfully!');
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  const handleEditItem = (item) => {
    navigation.navigate('UpdateItem', { item });
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inventory" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No items found</Text>
      <Text style={styles.emptySubtext}>Add some items to get started</Text>
      <Button
        title="Add Item"
        onPress={() => navigation.navigate('AddItem')}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Manage Items"
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddItem')}
            style={styles.addButton}
          >
            <Icon name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => handleEditItem(item)}
            onEdit={() => handleEditItem(item)}
            onDelete={() => handleDeletePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
      
      <ConfirmationModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    minWidth: 150,
  },
  addButton: {
    padding: SPACING.sm,
  },
});

export default DeleteItemScreen;