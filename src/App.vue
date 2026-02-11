<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// State
const companyName = ref("CodeClinics");
const fromInfo = ref(
  "Abdullah Younas\nPakistan\nabdullahyounas101197@gmail.com",
);
const billToInfo = ref("Rana Rajan\nTokyo, Japan\nclient@email.com");
const invoiceId = ref("INV-0001");
const invoiceDate = ref(new Date().toISOString().substr(0, 10));
const dueDate = ref("");
const currency = ref("PKR");
const projectTotal = ref(0);
const notes = ref(
  "Please include Invoice ID in the payment reference. Thank you.",
);
const logoUrl = ref(null);

const items = reactive([
  {
    description: "Website Design",
    amount: 0,
    mode: "Bank Transfer",
    date: new Date().toISOString().substr(0, 10),
  },
]);

// Initialization
onMounted(() => {
  const saved = localStorage.getItem("inv_vue_v1");
  if (saved) {
    const data = JSON.parse(saved);
    companyName.value = data.companyName;
    fromInfo.value = data.fromInfo;
    billToInfo.value = data.billToInfo;
    invoiceId.value = data.invoiceId;
    invoiceDate.value = data.invoiceDate;
    dueDate.value = data.dueDate;
    currency.value = data.currency;
    projectTotal.value = data.projectTotal;
    notes.value = data.notes;
    logoUrl.value = data.logoUrl;
    items.length = 0;
    items.push(...data.items);
  }

  if (!dueDate.value) {
    let due = new Date();
    due.setDate(due.getDate() + 14);
    dueDate.value = due.toISOString().substr(0, 10);
  }
});

// Auto-save
watch(
  [
    companyName,
    fromInfo,
    billToInfo,
    invoiceId,
    invoiceDate,
    dueDate,
    currency,
    projectTotal,
    notes,
    items,
    logoUrl,
  ],
  () => {
    const data = {
      companyName: companyName.value,
      fromInfo: fromInfo.value,
      billToInfo: billToInfo.value,
      invoiceId: invoiceId.value,
      invoiceDate: invoiceDate.value,
      dueDate: dueDate.value,
      currency: currency.value,
      projectTotal: projectTotal.value,
      notes: notes.value,
      logoUrl: logoUrl.value,
      items: JSON.parse(JSON.stringify(items)),
    };
    localStorage.setItem("inv_vue_v1", JSON.stringify(data));
  },
  { deep: true },
);

// Calculations
const subtotal = computed(() => {
  return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
});

const balanceDue = computed(() => {
  return (parseFloat(projectTotal.value) || 0) - subtotal.value;
});

const statusClass = computed(() => {
  if (subtotal.value === 0) return "unpaid";
  if (balanceDue.value > 0) return "partial";
  return "paid";
});

const statusText = computed(() => {
  if (subtotal.value === 0) return "Unpaid";
  if (balanceDue.value > 0) return "Partial";
  return "Paid";
});

// Actions
const addRow = () => {
  items.push({
    description: "",
    amount: 0,
    mode: "Bank Transfer",
    date: new Date().toISOString().substr(0, 10),
  });
};

const removeRow = (index) => {
  items.splice(index, 1);
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      logoUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const isGenerating = ref(false);

async function generatePDF() {
  isGenerating.value = true;
  const element = document.getElementById("invoice");

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`Invoice_${invoiceId.value}.pdf`);
  } catch (err) {
    console.error(err);
    alert("PDF generation failed.");
  } finally {
    isGenerating.value = false;
  }
}
</script>

<template>
  <div class="main-container">
    <div class="invoice-wrapper" id="invoice">
      <header class="top-section">
        <div class="logo-container">
          <input
            type="file"
            id="logo-input"
            hidden
            accept="image/*"
            @change="handleLogoUpload"
          />
          <div
            class="logo-box"
            @click="$el.querySelector('#logo-input').click()"
            title="Click to upload logo"
          >
            <img v-if="logoUrl" :src="logoUrl" alt="User Logo" />
            <span v-else style="color: var(--text-light); font-size: 24px"
              >+</span
            >
          </div>
          <input
            type="text"
            class="company-title"
            v-model="companyName"
            placeholder="Your Company"
          />
        </div>

        <div class="invoice-header">
          <h1>Invoice</h1>
          <div class="meta-row">
            <span class="meta-label">Invoice ID</span>
            <span class="meta-value"
              ><input type="text" v-model="invoiceId"
            /></span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-value"
              ><input type="date" v-model="invoiceDate"
            /></span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Due Date</span>
            <span class="meta-value"
              ><input type="date" v-model="dueDate"
            /></span>
          </div>
        </div>
      </header>

      <section class="info-grid">
        <div>
          <label class="info-label">From</label>
          <textarea v-model="fromInfo" rows="4"></textarea>
        </div>
        <div>
          <label class="info-label">Bill To</label>
          <textarea v-model="billToInfo" rows="4"></textarea>
        </div>
      </section>

      <div class="items-container">
        <table id="items-table">
          <thead>
            <tr>
              <th class="col-desc">Description</th>
              <th class="col-amt">Amount</th>
              <th class="col-mode">Payment Mode</th>
              <th class="col-date">Date</th>
              <th class="action-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td>
                <input
                  type="text"
                  v-model="item.description"
                  placeholder="e.g. Website Design"
                />
              </td>
              <td><input type="number" v-model="item.amount" /></td>
              <td>
                <select v-model="item.mode">
                  <option>Bank Transfer</option>
                  <option>Western Union</option>
                  <option>Cash</option>
                  <option>PayPal</option>
                </select>
              </td>
              <td><input type="date" v-model="item.date" /></td>
              <td class="action-col">
                <button class="action-btn" @click="removeRow(index)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-secondary btn-add" @click="addRow">
          + Add Line Item
        </button>
      </div>

      <footer class="bottom-section">
        <div class="notes-area">
          <label class="info-label">Notes & Payment Instructions</label>
          <textarea v-model="notes" rows="4"></textarea>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span>Currency</span>
            <select v-model="currency" style="width: auto; text-align: right">
              <option>PKR</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          <div class="summary-row">
            <span>Subtotal</span>
            <span class="summary-value">
              <span class="curr-symbol">{{ currency }}</span>
              {{ subtotal.toLocaleString() }}
            </span>
          </div>
          <div class="summary-row">
            <span>Total Project</span>
            <input
              type="number"
              v-model="projectTotal"
              style="
                width: 80px;
                text-align: right;
                background: transparent;
                font-family: &quot;Roboto Mono&quot;;
                font-weight: 500;
              "
            />
          </div>
          <div class="summary-row total">
            <span>Balance Due</span>
            <span class="summary-value">
              <span class="curr-symbol">{{ currency }}</span>
              {{ balanceDue.toLocaleString() }}
            </span>
          </div>
          <div class="summary-row" style="margin-top: 10px">
            <span>Status</span>
            <span :class="['status-tag', statusClass]">{{ statusText }}</span>
          </div>
        </div>
      </footer>
    </div>

    <div class="controls">
      <button
        class="btn btn-primary"
        @click="generatePDF"
        :disabled="isGenerating"
      >
        {{ isGenerating ? "Preparing..." : "Download Professional PDF" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* Scoped overrides if needed, but the global style.css handles most */
</style>
