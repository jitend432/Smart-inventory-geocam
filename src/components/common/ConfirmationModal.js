import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from './Button';
import { COLORS, SPACING, TYPOGRAPHY,SHADOWS } from '../../constants/theme';

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Icon
              name={type === 'danger' ? 'warning' : 'info'}
              size={40}
              color={type === 'danger' ? COLORS.danger : COLORS.warning}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onClose}
              type="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              type={type}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '85%',
    alignItems: 'center',
     ...SHADOWS.medium,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  confirmButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
});

export default ConfirmationModal;