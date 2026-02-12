/**
 * Formatting utilities for currency, dates, and numbers
 */

export const formatCurrency = (value, locale = "en-US") => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const formatCurrencyWithDecimals = (value, locale = "en-US") => {
  if (value === null || value === undefined) return "0.00";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export const formatDate = (dateString, locale = "en-US") => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits;
};

export const calculatePercentage = (value, percentage) => {
  return (Number(value) * Number(percentage)) / 100;
};

export const roundToTwo = (value) => {
  return Math.round(Number(value) * 100) / 100;
};
