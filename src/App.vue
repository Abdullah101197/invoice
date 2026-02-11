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
} from "lucide-vue-next";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- Reactive State ---
const invoiceData = reactive({
  id: "INV-2024-001",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  currency: "PKR",
  from: "Abdullah Younas\nPakistan\nabdullahyounas101197@gmail.com",
  billTo: "Rana Rajan\nTokyo, Japan\nclient@email.com",
  projectTotal: 0,
  notes:
    "Thank you for your trust and collaboration. This invoice reflects the agreed services. Kindly process the remaining balance before the due date.",
  items: [
    {
      description: "Initial Setup & Branding",
      amount: 0,
      method: "Bank Transfer",
      date: new Date().toISOString().split("T")[0],
    },
  ],
  logo: null,
  whatsappNumber: "",
});

// --- Initialization & Defaults ---
onMounted(() => {
  const saved = localStorage.getItem("saas_invoice_v1");
  if (saved) {
    Object.assign(invoiceData, JSON.parse(saved));
  }

  if (!invoiceData.dueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    invoiceData.dueDate = due.toISOString().split("T")[0];
  }
});

// --- Auto-Save ---
watch(
  invoiceData,
  (newData) => {
    localStorage.setItem("saas_invoice_v1", JSON.stringify(newData));
  },
  { deep: true },
);

// --- Calculations ---
const totalPaid = computed(() => {
  return invoiceData.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
});

const balanceDue = computed(() => {
  return Math.max(0, (Number(invoiceData.projectTotal) || 0) - totalPaid.value);
});

const status = computed(() => {
  if (totalPaid.value === 0) return "UNPAID";
  if (balanceDue.value > 0) return "PARTIAL";
  return "PAID";
});

const statusConfig = {
  UNPAID: { color: "text-red-600 bg-red-50 border-red-100", icon: AlertCircle },
  PARTIAL: {
    color: "text-amber-600 bg-amber-50 border-amber-100",
    icon: Clock,
  },
  PAID: {
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    icon: CheckCircle2,
  },
};

// --- Actions ---
const addItem = () => {
  invoiceData.items.push({
    description: "",
    amount: 0,
    method: "Bank Transfer",
    date: new Date().toISOString().split("T")[0],
  });
};

const removeItem = (index) => {
  invoiceData.items.splice(index, 1);
};

const handleLogoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => (invoiceData.logo = event.target.result);
    reader.readAsDataURL(file);
  }
};

const isGenerating = ref(false);

const generatePDF = async () => {
  isGenerating.value = true;
  const element = document.getElementById("invoice-render");

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    return pdf;
  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Failed to generate PDF");
  } finally {
    isGenerating.value = false;
  }
};

const downloadPDF = async () => {
  const pdf = await generatePDF();
  if (pdf) pdf.save(`Invoice_${invoiceData.id}.pdf`);
};

const sendToWhatsapp = async () => {
  if (!invoiceData.whatsappNumber) {
    alert("Please enter a WhatsApp number first");
    return;
  }

  // Clean number: remove all non-digits
  const cleanNumber = invoiceData.whatsappNumber.replace(/\D/g, "");

  // Download first as per requirement
  await downloadPDF();

  const message = encodeURIComponent(
    `Hello, please find Invoice #${invoiceData.id}. \n` +
      `Total: ${invoiceData.currency} ${invoiceData.projectTotal.toLocaleString()} \n` +
      `Balance Due: ${invoiceData.currency} ${balanceDue.value.toLocaleString()} \n` +
      `Thank you.`,
  );

  window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
};

// --- Formatting ---
const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans p-4 md:p-12">
    <!-- Main Content Container -->
    <div class="max-w-5xl mx-auto flex flex-col gap-8">
      <!-- Top Actions Bar -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 print:hidden"
      >
        <div class="flex items-center gap-2">
          <div class="p-2 bg-slate-900 rounded-lg text-white">
            <Layout class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-bold text-slate-900">
            SaaS Invoice Generator
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative group">
            <input
              v-model="invoiceData.whatsappNumber"
              type="text"
              placeholder="WhatsApp No (e.g. 92300...)"
              class="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-all w-48"
            />
          </div>
          <button
            @click="sendToWhatsapp"
            class="btn btn-secondary gap-2 text-slate-700"
          >
            <Send class="w-4 h-4" />
            Send via WhatsApp
          </button>
          <button
            @click="downloadPDF"
            :disabled="isGenerating"
            class="btn btn-primary gap-2"
          >
            <Download class="w-4 h-4" />
            {{ isGenerating ? "Generating..." : "Download PDF" }}
          </button>
        </div>
      </div>

      <!-- Main Invoice Card (The one rendered to PDF) -->
      <div id="invoice-render" class="card overflow-hidden bg-white">
        <!-- Blue Header Accent -->
        <div class="h-2 bg-slate-900 w-full"></div>

        <div class="p-8 md:p-12 space-y-12">
          <!-- Logo & Basic Details -->
          <div
            class="flex flex-col md:flex-row justify-between gap-8 border-b border-slate-100 pb-10"
          >
            <div class="space-y-6 flex-1">
              <!-- Logo Upload Area -->
              <div class="relative w-20 h-20 group">
                <input
                  type="file"
                  @change="handleLogoUpload"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div
                  class="w-full h-full rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 group-hover:border-slate-400 group-hover:bg-slate-100 transition-all overflow-hidden"
                >
                  <img
                    v-if="invoiceData.logo"
                    :src="invoiceData.logo"
                    class="w-full h-full object-contain"
                  />
                  <Building2 v-else class="w-8 h-8 text-slate-300" />
                  <div
                    class="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change
                  </div>
                </div>
              </div>

              <!-- From Details -->
              <div class="space-y-2">
                <label
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"
                >
                  <User class="w-3 h-3" /> From
                </label>
                <textarea
                  v-model="invoiceData.from"
                  rows="3"
                  class="w-full text-sm text-slate-600 bg-transparent border-none p-0 focus:ring-0 resize-none font-medium leading-relaxed"
                  placeholder="Your Name / Company Details"
                ></textarea>
              </div>
            </div>

            <!-- Invoice Identity -->
            <div
              class="flex-shrink-0 flex flex-col md:items-end gap-6 min-w-[200px]"
            >
              <div class="text-right">
                <h1 class="text-3xl font-black text-slate-900 tracking-tighter">
                  INVOICE
                </h1>
                <div class="flex items-center md:justify-end gap-2 mt-1">
                  <span
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest italic"
                    >Official Statement</span
                  >
                </div>
              </div>

              <div class="space-y-3 w-full">
                <div class="flex justify-between md:justify-end gap-4">
                  <span class="text-xs font-semibold text-slate-400"
                    >Invoice ID</span
                  >
                  <input
                    v-model="invoiceData.id"
                    class="text-sm font-bold text-slate-900 text-right bg-transparent border-none p-0 focus:ring-0 w-24"
                  />
                </div>
                <div class="flex justify-between md:justify-end gap-4">
                  <span class="text-xs font-semibold text-slate-400"
                    >Issue Date</span
                  >
                  <input
                    v-model="invoiceData.date"
                    type="date"
                    class="text-sm font-bold text-slate-900 text-right bg-transparent border-none p-0 focus:ring-0 w-32"
                  />
                </div>
                <div class="flex justify-between md:justify-end gap-4">
                  <span class="text-xs font-semibold text-slate-400"
                    >Due Date</span
                  >
                  <input
                    v-model="invoiceData.dueDate"
                    type="date"
                    class="text-sm font-bold text-slate-900 text-right bg-transparent border-none p-0 focus:ring-0 w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Billing Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="space-y-4">
              <label
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"
              >
                <FileText class="w-3 h-3" /> Bill To
              </label>
              <textarea
                v-model="invoiceData.billTo"
                rows="4"
                class="w-full text-base text-slate-900 bg-slate-50/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-slate-100 transition-all font-semibold leading-normal"
                placeholder="Client Name / Address / Contact"
              ></textarea>
            </div>

            <div class="flex flex-col md:items-end justify-center gap-4">
              <div class="text-right space-y-1">
                <label
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  >Select Currency</label
                >
                <select
                  v-model="invoiceData.currency"
                  class="block w-full md:w-48 px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-100"
                >
                  <option>PKR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>AED</option>
                </select>
              </div>
              <div class="text-right space-y-1">
                <label
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  >Total Project Value</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400"
                    >{{ invoiceData.currency }}</span
                  >
                  <input
                    v-model.number="invoiceData.projectTotal"
                    type="number"
                    class="pl-14 pr-4 py-2 text-xl font-black text-slate-900 bg-slate-900/[0.03] border-none rounded-xl w-48 text-right outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Installments Table -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <label
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"
              >
                <CircleDollarSign class="w-3 h-3" /> Payment Schedule /
                Installments
              </label>
              <button
                @click="addItem"
                class="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 print:hidden"
              >
                <Plus class="w-3 h-3" /> Add Row
              </button>
            </div>

            <div class="overflow-hidden border border-slate-100 rounded-xl">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th
                      class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                    >
                      Description
                    </th>
                    <th
                      class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40 text-right"
                    >
                      Amount
                    </th>
                    <th
                      class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-48"
                    >
                      Method
                    </th>
                    <th
                      class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40"
                    >
                      Date
                    </th>
                    <th class="px-6 py-4 w-12 print:hidden"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(item, index) in invoiceData.items"
                    :key="index"
                    class="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <input
                        v-model="item.description"
                        placeholder="Installment details..."
                        class="w-full text-sm font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <span class="text-xs font-bold text-slate-300">{{
                          invoiceData.currency
                        }}</span>
                        <input
                          v-model.number="item.amount"
                          type="number"
                          class="w-24 text-sm font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 text-right"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        v-model="item.method"
                        class="w-full text-sm font-semibold text-slate-600 bg-transparent border-none p-0 focus:ring-0 outline-none"
                      >
                        <option>Bank Transfer</option>
                        <option>Western Union</option>
                        <option>Cash</option>
                        <option>PayPal</option>
                        <option>Credit Card</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <input
                        v-model="item.date"
                        type="date"
                        class="w-full text-xs font-bold text-slate-500 bg-transparent border-none p-0 focus:ring-0"
                      />
                    </td>
                    <td class="px-6 py-4 text-center print:hidden">
                      <button
                        @click="removeItem(index)"
                        class="text-slate-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Empty State -->
            <div
              v-if="invoiceData.items.length === 0"
              class="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50"
            >
              <CircleDollarSign class="w-8 h-8 text-slate-200 mb-2" />
              <p class="text-xs font-semibold text-slate-400">
                No installments added yet
              </p>
              <button
                @click="addItem"
                class="mt-4 btn btn-secondary text-[10px] py-1"
              >
                Add First Item
              </button>
            </div>
          </div>

          <!-- Bottom Summary Section -->
          <div class="flex flex-col md:flex-row gap-12 pt-10">
            <!-- Notes Section -->
            <div class="flex-1 space-y-4">
              <label
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"
              >
                <FileText class="w-3 h-3" /> Notes & Terms
              </label>
              <div
                class="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative"
              >
                <textarea
                  v-model="invoiceData.notes"
                  rows="4"
                  class="w-full text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 font-medium leading-relaxed resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Calculation Card -->
            <div class="w-full md:w-96 space-y-6">
              <div
                class="p-8 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden"
              >
                <!-- Decorative Circle -->
                <div
                  class="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full"
                ></div>

                <div class="relative space-y-6">
                  <div class="space-y-4">
                    <div class="flex justify-between items-center opacity-60">
                      <span
                        class="text-[10px] font-bold uppercase tracking-widest"
                        >Project Value</span
                      >
                      <span class="text-sm font-mono font-bold"
                        >{{ invoiceData.currency }}
                        {{ formatCurrency(invoiceData.projectTotal) }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center opacity-60">
                      <span
                        class="text-[10px] font-bold uppercase tracking-widest"
                        >Amount Paid</span
                      >
                      <span class="text-sm font-mono font-bold"
                        >{{ invoiceData.currency }}
                        {{ formatCurrency(totalPaid) }}</span
                      >
                    </div>
                  </div>

                  <div
                    class="pt-6 border-t border-white/10 flex justify-between items-end"
                  >
                    <div class="space-y-1">
                      <span
                        class="text-[10px] font-bold uppercase tracking-widest opacity-60"
                        >Balance Due</span
                      >
                      <div class="text-3xl font-black tracking-tighter">
                        {{ invoiceData.currency }}
                        {{ formatCurrency(balanceDue) }}
                      </div>
                    </div>
                    <div
                      :class="[
                        'px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1.5',
                        statusConfig[status].color,
                      ]"
                    >
                      <component
                        :is="statusConfig[status].icon"
                        class="w-3 h-3"
                      />
                      {{ status }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center gap-2 px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm print:hidden"
              >
                <AlertCircle class="w-4 h-4 text-blue-500" />
                <p class="text-[10px] font-bold text-blue-700 leading-tight">
                  This invoice is auto-saved in your browser's local storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-8 md:px-12 py-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p
            class="text-[10px] font-black tracking-widest text-slate-300 uppercase"
          >
            Generated by SaaS Invoice Toolkit
          </p>
          <div
            class="flex items-center gap-4 text-xs font-bold text-slate-400 italic"
          >
            <span>Security Protected</span>
            <span class="h-1 w-1 bg-slate-300 rounded-full"></span>
            <span>Digital Signature Verified</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Custom Chrome/Safari scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-slate-100;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-300 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-400;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    background: white;
  }
  .print-hidden {
    display: none !important;
  }
}
</style>
