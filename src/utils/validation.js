export const validateItem = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Item name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Item name must be at least 2 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Item name must be less than 50 characters';
  }

  if (data.description && data.description.length > 200) {
    errors.description = 'Description must be less than 200 characters';
  }

  if (!data.quantity || data.quantity.toString().trim().length === 0) {
    errors.quantity = 'Quantity is required';
  } else if (isNaN(data.quantity) || parseInt(data.quantity, 10) < 0) {
    errors.quantity = 'Quantity must be a valid positive number';
  } else if (!Number.isInteger(parseFloat(data.quantity))) {
    errors.quantity = 'Quantity must be a whole number';
  }

  if (!data.price || data.price.toString().trim().length === 0) {
    errors.price = 'Price is required';
  } else if (isNaN(data.price) || parseFloat(data.price) < 0) {
    errors.price = 'Price must be a valid positive number';
  } else if (parseFloat(data.price) > 999999.99) {
    errors.price = 'Price must be less than 1,000,000';
  }

  return errors;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};