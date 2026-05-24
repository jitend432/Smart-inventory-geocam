import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';

const ItemCard = ({ item, onPress, onEdit, onDelete }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Icon name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Icon name="delete" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="inventory" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>Qty: {item.quantity}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="attach-money" size={16} color={COLORS.textLight} />
            <Text style={styles.detailText}>${parseFloat(item.price).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  cardContent: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemName: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: SPACING.md,
    padding: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  details: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
});

export default ItemCard;