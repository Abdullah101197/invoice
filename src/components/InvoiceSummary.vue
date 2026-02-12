<template>
  <div class="space-y-4">
    <!-- Summary Card -->
    <div
      class="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-2xl relative overflow-hidden"
    >
      <!-- Decorative Elements -->
      <div
        class="absolute -right-20 -top-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"
      ></div>

      <div class="relative space-y-4">
        <!-- Project Value -->
        <div
          class="flex justify-between items-center pb-4 border-b border-white/10"
        >
          <span
            class="text-xs font-semibold uppercase tracking-wider opacity-70"
          >
            Project Value
          </span>
          <span class="text-xl font-black tracking-tight">
            {{ currency }} {{ formatCurrency(projectTotal) }}
          </span>
        </div>

        <!-- Tax -->
        <div v-if="taxAmount > 0" class="flex justify-between items-center">
          <span
            class="text-xs font-semibold uppercase tracking-wider opacity-70"
          >
            Tax ({{ taxRate }}%)
          </span>
          <span class="text-lg font-bold"
            >{{ currency }} {{ formatCurrency(taxAmount) }}</span
          >
        </div>

        <!-- Discount -->
        <div
          v-if="discountAmount > 0"
          class="flex justify-between items-center"
        >
          <span
            class="text-xs font-semibold uppercase tracking-wider opacity-70"
          >
            Discount
          </span>
          <span class="text-lg font-bold text-emerald-400">
            -{{ currency }} {{ formatCurrency(discountAmount) }}
          </span>
        </div>

        <!-- Amount Paid -->
        <div
          class="flex justify-between items-center pb-4 border-b border-white/10"
        >
          <span
            class="text-xs font-semibold uppercase tracking-wider opacity-70"
          >
            Amount Paid
          </span>
          <span class="text-xl font-bold text-emerald-400">
            {{ currency }} {{ formatCurrency(totalPaid) }}
          </span>
        </div>

        <!-- Balance Due -->
        <div class="pt-2">
          <p
            class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2"
          >
            Balance Due
          </p>
          <div class="flex justify-between items-end gap-4">
            <div class="text-3xl font-black tracking-tighter">
              {{ currency }} {{ formatCurrency(balanceDue) }}
            </div>
            <div
              :class="[
                'px-4 py-2 rounded-full border font-black text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0',
                statusClass,
              ]"
            >
              <component :is="statusIcon" class="w-4 h-4" />
              {{ status }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Messages -->
    <div
      class="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
    >
      <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div class="text-xs text-blue-700 space-y-1">
        <p class="font-semibold">Auto-Save Enabled</p>
        <p>All changes are automatically saved to your browser.</p>
      </div>
    </div>

    <!-- Additional Fields -->
    <div class="space-y-3">
      <!-- Tax Rate -->
      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Tax Rate (%)
        </label>
        <div class="flex gap-2">
          <input
            :value="taxRate"
            @input="
              $emit('update:taxRate', parseFloat($event.target.value) || 0)
            "
            type="number"
            min="0"
            max="100"
            step="0.5"
            placeholder="0"
            class="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
          />
          <span
            class="px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 rounded-lg"
          >
            = {{ currency }} {{ formatCurrency(taxAmount) }}
          </span>
        </div>
      </div>

      <!-- Discount -->
      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Discount (%)
        </label>
        <div class="flex gap-2">
          <input
            :value="discountRate"
            @input="
              $emit('update:discountRate', parseFloat($event.target.value) || 0)
            "
            type="number"
            min="0"
            max="100"
            step="0.5"
            placeholder="0"
            class="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
          />
          <span
            class="px-3 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-lg"
          >
            -{{ currency }} {{ formatCurrency(discountAmount) }}
          </span>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Notes & Terms
        </label>
        <textarea
          :value="notes"
          @input="$emit('update:notes', $event.target.value)"
          rows="4"
          placeholder="Add payment terms, conditions, or notes here..."
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all resize-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-vue-next";
import { formatCurrency } from "../utils/formatting.js";

const props = defineProps({
  projectTotal: {
    type: Number,
    default: 0,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  discountRate: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "UNPAID",
  },
});

const emit = defineEmits([
  "update:taxRate",
  "update:discountRate",
  "update:notes",
]);

const taxAmount = computed(
  () => Math.round(((props.projectTotal * props.taxRate) / 100) * 100) / 100,
);

const discountAmount = computed(
  () =>
    Math.round(((props.projectTotal * props.discountRate) / 100) * 100) / 100,
);

const balanceDue = computed(() => {
  const total = props.projectTotal + taxAmount.value - discountAmount.value;
  return Math.max(0, total - props.totalPaid);
});

const statusClass = computed(() => {
  switch (props.status) {
    case "UNPAID":
      return "border-red-200 text-red-600 bg-red-50";
    case "PARTIAL":
      return "border-amber-200 text-amber-600 bg-amber-50";
    case "PAID":
      return "border-emerald-200 text-emerald-600 bg-emerald-50";
    default:
      return "border-slate-200 text-slate-600 bg-slate-50";
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case "UNPAID":
      return AlertCircle;
    case "PARTIAL":
      return Clock;
    case "PAID":
      return CheckCircle2;
    default:
      return AlertCircle;
  }
});

import { computed } from "vue";
</script>
