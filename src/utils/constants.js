/**
 * Invoice defaults and constants
 */

export const INVOICE_DEFAULTS = {
  id: "INV-" + new Date().getFullYear() + "-001",
  date: new Date().toISOString().split("T")[0],
  dueDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  })(),
  currency: "USD",
  from: "Your Company Name\nCity, Country\nemail@example.com",
  billTo: "Client Name\nCity, Country\nclient@email.com",
  projectTotal: 0,
  tax: 0,
  taxRate: 0,
  discount: 0,
  discountRate: 0,
  notes:
    "Thank you for your trust and collaboration. This invoice reflects the agreed services. Kindly process the payment before the due date.",
  items: [
    {
      description: "Service Description",
      amount: 0,
      method: "Bank Transfer",
      date: new Date().toISOString().split("T")[0],
    },
  ],
  logo: null,
  whatsappNumber: "",
  paymentTerms: "NET 14",
  bankDetails: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    swiftCode: "",
  },
};

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "Check",
  "Cash",
  "Credit Card",
  "PayPal",
  "Google Pay",
  "Apple Pay",
  "Wire Transfer",
  "Cryptocurrency",
  "Other",
];

export const PAYMENT_TERMS = [
  "NET 7",
  "NET 14",
  "NET 30",
  "NET 45",
  "NET 60",
  "DUE ON RECEIPT",
  "CUSTOM",
];

export const TAX_TYPES = [
  { code: "NONE", name: "No Tax", rate: 0 },
  { code: "GST", name: "GST (5%)", rate: 5 },
  { code: "VAT", name: "VAT (20%)", rate: 20 },
  { code: "TAX", name: "Sales Tax (7%)", rate: 7 },
  { code: "PST", name: "PST (8%)", rate: 8 },
  { code: "CUSTOM", name: "Custom Tax Rate", rate: 0 },
];

export const INVOICE_TEMPLATES = {
  minimal: {
    name: "Minimal",
    description: "Clean and simple invoice",
  },
  professional: {
    name: "Professional",
    description: "Corporate professional design",
  },
  creative: {
    name: "Creative",
    description: "Modern and colorful design",
  },
  detailed: {
    name: "Detailed",
    description: "Comprehensive with all details",
  },
};

export const STATUS_CONFIG = {
  UNPAID: {
    label: "UNPAID",
    color: "text-red-600 bg-red-50 border-red-100",
  },
  PARTIAL: {
    label: "PARTIAL",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  PAID: {
    label: "PAID",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
};
