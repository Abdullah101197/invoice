/**
 * Validation utilities
 */

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
};

export const validateInvoiceId = (id) => {
  return id && id.trim().length > 0;
};

export const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num >= 0;
};

export const validateLineItem = (item) => {
  return (
    item.description &&
    item.description.trim().length > 0 &&
    validateAmount(item.amount || 0)
  );
};

export const validateInvoice = (invoiceData) => {
  const errors = [];

  if (!invoiceData.id || !invoiceData.id.trim()) {
    errors.push("Invoice ID is required");
  }

  if (!invoiceData.date) {
    errors.push("Invoice date is required");
  }

  if (!invoiceData.billTo || !invoiceData.billTo.trim()) {
    errors.push("Bill to is required");
  }

  if (!invoiceData.projectTotal || invoiceData.projectTotal <= 0) {
    errors.push("Project total must be greater than 0");
  }

  if (invoiceData.items.length === 0) {
    errors.push("At least one payment item is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
