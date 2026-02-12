<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import {
  Plus,
  Trash2,
  Download,
  Send,
  CircleDollarSign,
  Calendar,
  FileText,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layout,
  Mail,
  Share2,
} from "lucide-vue-next";

// Import components
import InvoiceHeader from "./components/InvoiceHeader.vue";
import CompanyDetails from "./components/CompanyDetails.vue";
import InvoiceDetails from "./components/InvoiceDetails.vue";
import PaymentItems from "./components/PaymentItems.vue";
import InvoiceSummary from "./components/InvoiceSummary.vue";

// Import utilities
import { formatCurrency, formatDate } from "./utils/formatting.js";
import { validateInvoice } from "./utils/validation.js";
import { StorageService } from "./utils/storage.js";
import { PDFExportService, ExportService } from "./utils/export.js";
import {
  INVOICE_DEFAULTS,
  CURRENCIES,
  PAYMENT_METHODS,
  PAYMENT_TERMS,
} from "./utils/constants.js";

// --- UI State ---
const isGenerating = ref(false);
const showSettings = ref(false);
const invoiceElements = ref(null);
const errorMessage = ref("");
const successMessage = ref("");

// --- Reactive State ---
const invoiceData = reactive({ ...INVOICE_DEFAULTS });

// --- Initialization & Defaults ---
onMounted(() => {
  const saved = StorageService.loadCurrentInvoice();
  if (saved) {
    Object.assign(invoiceData, saved);
  }

  if (!invoiceData.dueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    invoiceData.dueDate = due.toISOString().split("T")[0];
  }

  if (!invoiceData.taxRate) {
    invoiceData.taxRate = 0;
  }
  if (!invoiceData.discountRate) {
    invoiceData.discountRate = 0;
  }
});

// --- Auto-Save ---
watch(
  invoiceData,
  (newData) => {
    StorageService.saveCurrentInvoice(newData);
  },
  { deep: true, throttle: 1000 },
);

// --- Calculations ---
const totalPaid = computed(() => {
  return invoiceData.items.reduce(
    (sum, item) => sum + (item.quantity || 1) * (item.rate || 0),
    0,
  );
});

const taxAmount = computed(() => {
  return (
    Math.round(((totalPaid.value * (invoiceData.taxRate || 0)) / 100) * 100) /
    100
  );
});

const discountAmount = computed(() => {
  return (
    Math.round(
      ((invoiceData.projectTotal * (invoiceData.discountRate || 0)) / 100) *
        100,
    ) / 100
  );
});

const balanceDue = computed(() => {
  const total =
    (invoiceData.projectTotal || 0) + taxAmount.value - discountAmount.value;
  return Math.max(0, total - totalPaid.value);
});

const status = computed(() => {
  if (totalPaid.value === 0) return "UNPAID";
  if (balanceDue.value > 0) return "PARTIAL";
  return "PAID";
});

// --- Actions ---
const addItem = () => {
  invoiceData.items.push({
    description: "",
    quantity: 1,
    rate: 0,
    method: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
  });
};

const removeItem = (index) => {
  invoiceData.items.splice(index, 1);
};

const updateItem = ({ index, field, value }) => {
  if (invoiceData.items[index]) {
    invoiceData.items[index][field] = value;
    if (field === "quantity" || field === "rate") {
      invoiceData.items[index].amount =
        (invoiceData.items[index].quantity || 1) *
        (invoiceData.items[index].rate || 0);
    }
  }
};

const handleLogoUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      invoiceData.logo = event.target?.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeLogo = () => {
  invoiceData.logo = null;
};

// --- PDF & Export Actions ---
const downloadPDF = async () => {
  const validation = validateInvoice(invoiceData);
  if (!validation.isValid) {
    errorMessage.value = "Cannot generate PDF: " + validation.errors.join(", ");
    setTimeout(() => (errorMessage.value = ""), 5000);
    return;
  }

  try {
    isGenerating.value = true;
    const result = await PDFExportService.downloadPDF(
      document.getElementById("invoice-render"),
      invoiceData.id,
    );

    if (result.success) {
      successMessage.value = "PDF downloaded successfully!";
      StorageService.addToHistory(invoiceData);
    } else {
      errorMessage.value = result.error;
    }
  } catch (err) {
    errorMessage.value = "Failed to generate PDF: " + err.message;
  } finally {
    isGenerating.value = false;
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  }
};

const exportCSV = () => {
  try {
    ExportService.downloadCSV(invoiceData);
    successMessage.value = "CSV exported successfully!";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    errorMessage.value = "Failed to export CSV: " + err.message;
    setTimeout(() => (errorMessage.value = ""), 5000);
  }
};

const exportJSON = () => {
  try {
    ExportService.downloadJSON(invoiceData);
    successMessage.value = "JSON exported successfully!";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    errorMessage.value = "Failed to export JSON: " + err.message;
    setTimeout(() => (errorMessage.value = ""), 5000);
  }
};

const sendToWhatsapp = async () => {
  if (!invoiceData.whatsappNumber) {
    errorMessage.value = "Please enter a WhatsApp number first";
    setTimeout(() => (errorMessage.value = ""), 3000);
    return;
  }

  const cleanNumber = invoiceData.whatsappNumber.replace(/\D/g, "");

  try {
    const message = encodeURIComponent(
      `Hello, please find Invoice #${invoiceData.id}.\n` +
        `Total: ${invoiceData.currency} ${formatCurrency(invoiceData.projectTotal)}\n` +
        `Balance Due: ${invoiceData.currency} ${formatCurrency(balanceDue.value)}\n` +
        `Thank you.`,
    );

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
    StorageService.addToHistory(invoiceData);
    successMessage.value = "Redirecting to WhatsApp...";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    errorMessage.value = "Failed to send WhatsApp message: " + err.message;
    setTimeout(() => (errorMessage.value = ""), 5000);
  }
};

const saveToHistory = () => {
  const validation = validateInvoice(invoiceData);
  if (!validation.isValid) {
    errorMessage.value = "Cannot save: " + validation.errors.join(", ");
    setTimeout(() => (errorMessage.value = ""), 5000);
    return;
  }

  if (StorageService.addToHistory(invoiceData)) {
    successMessage.value = "Invoice saved to history!";
    setTimeout(() => (successMessage.value = ""), 3000);
  } else {
    errorMessage.value = "Failed to save invoice";
    setTimeout(() => (errorMessage.value = ""), 3000);
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 font-sans p-4 md:p-8"
  >
    <!-- Alert Messages -->
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-50 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-lg max-w-sm"
    >
      {{ errorMessage }}
    </div>
    <div
      v-if="successMessage"
      class="fixed top-4 right-4 z-50 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-lg max-w-sm"
    >
      {{ successMessage }}
    </div>

    <!-- Main Container -->
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <InvoiceHeader
        @save-history="saveToHistory"
        @export-csv="exportCSV"
        @export-json="exportJSON"
        @settings="showSettings = true"
      />

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <!-- Left Panel -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card">
            <h3
              class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"
            >
              <Building2 class="w-4 h-4" />
              Company
            </h3>
            <CompanyDetails
              v-model="invoiceData"
              :logoUrl="invoiceData.logo"
              @logo-uploaded="handleLogoUpload"
              @remove-logo="removeLogo"
            />
          </div>

          <div class="card">
            <h3
              class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"
            >
              <Calendar class="w-4 h-4" />
              Details
            </h3>
            <InvoiceDetails
              v-model="invoiceData"
              @update:modelValue="(val) => Object.assign(invoiceData, val)"
              @update:bankDetails="(val) => (invoiceData.bankDetails = val)"
            />
          </div>

          <div class="flex flex-col gap-2 print:hidden">
            <button
              @click="downloadPDF"
              :disabled="isGenerating"
              class="btn btn-primary gap-2 justify-center"
            >
              <Download class="w-4 h-4" />
              {{ isGenerating ? "Generating..." : "Download PDF" }}
            </button>
            <button
              @click="sendToWhatsapp"
              class="btn btn-secondary gap-2 justify-center"
            >
              <Send class="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="lg:col-span-2 space-y-6">
          <div class="lg:sticky lg:top-8">
            <InvoiceSummary
              :projectTotal="invoiceData.projectTotal"
              :totalPaid="totalPaid"
              :currency="invoiceData.currency"
              :taxRate="invoiceData.taxRate"
              :discountRate="invoiceData.discountRate"
              :notes="invoiceData.notes"
              :status="status"
              @update:taxRate="invoiceData.taxRate = $event"
              @update:discountRate="invoiceData.discountRate = $event"
              @update:notes="invoiceData.notes = $event"
            />
          </div>

          <div class="card">
            <PaymentItems
              :items="invoiceData.items"
              :currency="invoiceData.currency"
              :taxRate="invoiceData.taxRate"
              @add-item="addItem"
              @remove-item="removeItem"
              @update-item="updateItem"
            />
          </div>

          <div class="card">
            <h3
              class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"
            >
              <CircleDollarSign class="w-4 h-4" />
              Total Value
            </h3>
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400"
              >
                {{ invoiceData.currency }}
              </span>
              <input
                v-model.number="invoiceData.projectTotal"
                type="number"
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 text-2xl font-black text-slate-900 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Preview -->
      <div
        id="invoice-render"
        ref="invoiceElements"
        class="mt-12 card overflow-hidden bg-white print:shadow-none"
      >
        <div
          class="h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 w-full"
        ></div>

        <div class="p-8 md:p-12 space-y-12">
          <div
            class="flex flex-col md:flex-row justify-between gap-8 border-b border-slate-100 pb-10"
          >
            <div class="space-y-6 flex-1">
              <div
                v-if="invoiceData.logo"
                class="w-24 h-24 rounded-lg overflow-hidden bg-slate-50 border border-slate-200"
              >
                <img
                  :src="invoiceData.logo"
                  class="w-full h-full object-contain"
                  alt="Logo"
                />
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  From
                </p>
                <p
                  class="text-sm text-slate-700 font-semibold whitespace-pre-line leading-relaxed"
                >
                  {{ invoiceData.from }}
                </p>
              </div>
            </div>

            <div class="flex-shrink-0 space-y-6">
              <div class="text-right">
                <h1 class="text-4xl font-black text-slate-900 tracking-tighter">
                  INVOICE
                </h1>
                <p class="text-xs text-slate-400 font-semibold italic mt-2">
                  Professional Invoice
                </p>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <span class="text-xs font-semibold text-slate-400"
                    >Invoice #</span
                  >
                  <span class="font-bold text-slate-900">{{
                    invoiceData.id
                  }}</span>
                </div>
                <div class="flex justify-between gap-4">
                  <span class="text-xs font-semibold text-slate-400">Date</span>
                  <span class="font-semibold text-slate-900">{{
                    formatDate(invoiceData.date)
                  }}</span>
                </div>
                <div class="flex justify-between gap-4">
                  <span class="text-xs font-semibold text-slate-400">Due</span>
                  <span class="font-semibold text-slate-900">{{
                    formatDate(invoiceData.dueDate)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="space-y-2">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Bill To
              </p>
              <p
                class="text-base text-slate-900 font-semibold whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg"
              >
                {{ invoiceData.billTo }}
              </p>
            </div>
            <div v-if="invoiceData.bankDetails?.accountName" class="space-y-2">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Bank Details
              </p>
              <div class="bg-slate-50 p-4 rounded-lg space-y-1 text-sm">
                <p>
                  <span class="font-semibold text-slate-600">Account:</span>
                  {{ invoiceData.bankDetails.accountName }}
                </p>
                <p v-if="invoiceData.bankDetails.bankName">
                  <span class="font-semibold text-slate-600">Bank:</span>
                  {{ invoiceData.bankDetails.bankName }}
                </p>
                <p v-if="invoiceData.bankDetails.accountNumber">
                  <span class="font-semibold text-slate-600">Acc #:</span>
                  {{ invoiceData.bankDetails.accountNumber }}
                </p>
                <p v-if="invoiceData.bankDetails.swiftCode">
                  <span class="font-semibold text-slate-600">SWIFT:</span>
                  {{ invoiceData.bankDetails.swiftCode }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <p
              class="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              Payment Schedule
            </p>
            <div class="overflow-hidden border border-slate-200 rounded-lg">
              <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 text-right"
                    >
                      Qty
                    </th>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24 text-right"
                    >
                      Rate
                    </th>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28 text-right"
                    >
                      Amount
                    </th>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Method
                    </th>
                    <th
                      class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(item, index) in invoiceData.items"
                    :key="index"
                    class="hover:bg-slate-50"
                  >
                    <td class="px-6 py-4 text-sm font-semibold text-slate-900">
                      {{ item.description }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm font-bold text-slate-900 text-right"
                    >
                      {{ item.quantity || 1 }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm font-bold text-slate-900 text-right"
                    >
                      {{ invoiceData.currency }}
                      {{ formatCurrency(item.rate || 0) }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm font-bold text-slate-900 text-right"
                    >
                      {{ invoiceData.currency }}
                      {{ formatCurrency(item.amount || item.rate || 0) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ item.method }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ formatDate(item.date) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            class="flex flex-col md:flex-row gap-12 pt-4 border-t border-slate-100"
          >
            <div class="flex-1 space-y-2">
              <p
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Notes & Terms
              </p>
              <p
                class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg whitespace-pre-line"
              >
                {{ invoiceData.notes }}
              </p>
            </div>
            <div class="w-full md:w-80">
              <div
                class="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white space-y-3"
              >
                <div class="flex justify-between text-sm opacity-70">
                  <span class="font-semibold">Subtotal</span>
                  <span class="font-mono"
                    >{{ invoiceData.currency }}
                    {{ formatCurrency(totalPaid) }}</span
                  >
                </div>
                <div
                  v-if="invoiceData.taxRate > 0"
                  class="flex justify-between text-sm opacity-70"
                >
                  <span class="font-semibold"
                    >Tax ({{ invoiceData.taxRate }}%)</span
                  >
                  <span class="font-mono"
                    >{{ invoiceData.currency }}
                    {{ formatCurrency(taxAmount) }}</span
                  >
                </div>
                <div
                  v-if="invoiceData.discountRate > 0"
                  class="flex justify-between text-sm text-emerald-400"
                >
                  <span class="font-semibold"
                    >Discount ({{ invoiceData.discountRate }}%)</span
                  >
                  <span class="font-mono"
                    >-{{ invoiceData.currency }}
                    {{ formatCurrency(discountAmount) }}</span
                  >
                </div>
                <div class="pt-3 border-t border-white/10 flex justify-between">
                  <span class="font-bold">BALANCE DUE</span>
                  <span class="text-2xl font-black"
                    >{{ invoiceData.currency }}
                    {{ formatCurrency(balanceDue) }}</span
                  >
                </div>
                <div
                  class="pt-2 flex items-center justify-between text-xs font-bold"
                >
                  <span>Status</span>
                  <span class="bg-white/20 px-3 py-1 rounded-full">{{
                    status
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400"
        >
          <p class="font-semibold tracking-widest">
            Professional Invoice Generator
          </p>
          <div class="flex items-center gap-4">
            <span>Secure & Confidential</span>
            <span>•</span>
            <span>Auto-Saved</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all hover:shadow-md;
}

.btn {
  @apply inline-flex items-center px-4 py-2.5 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg;
}

.btn-secondary {
  @apply bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-slate-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-slate-300 rounded-full hover:bg-slate-400 transition-colors;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

@page {
  size: A4;
  margin: 0;
}
</style>
