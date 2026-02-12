<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label
        class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
      >
        <DollarSign class="w-3 h-3" />
        Payment Schedule
      </label>
      <button
        @click="$emit('add-item')"
        class="text-xs font-semibold text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 print:hidden"
      >
        <Plus class="w-3 h-3" />
        Add Payment
      </button>
    </div>

    <!-- Items Table -->
    <div class="overflow-x-auto border border-slate-200 rounded-lg">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24 text-right"
            >
              Quantity
            </th>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28 text-right"
            >
              Rate
            </th>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32 text-right"
            >
              Amount
            </th>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32"
            >
              Method
            </th>
            <th
              class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28"
            >
              Date
            </th>
            <th class="px-4 py-3 w-8 print:hidden"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(item, index) in items"
            :key="index"
            class="hover:bg-slate-50 transition-colors group"
          >
            <td class="px-4 py-3">
              <input
                :value="item.description"
                @input="updateItem(index, 'description', $event.target.value)"
                placeholder="Payment description..."
                class="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-900"
              />
            </td>
            <td class="px-4 py-3 text-right">
              <input
                :value="item.quantity || 1"
                @input="
                  updateItem(
                    index,
                    'quantity',
                    parseInt($event.target.value) || 1,
                  )
                "
                type="number"
                min="1"
                class="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-semibold text-slate-900 text-right"
              />
            </td>
            <td class="px-4 py-3 text-right">
              <input
                :value="item.rate || 0"
                @input="
                  updateItem(
                    index,
                    'rate',
                    parseFloat($event.target.value) || 0,
                  )
                "
                type="number"
                placeholder="0"
                class="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-semibold text-slate-900 text-right"
              />
            </td>
            <td class="px-4 py-3 text-right font-semibold text-slate-900">
              {{ currency }} {{ formatCurrency(item.amount || 0) }}
            </td>
            <td class="px-4 py-3">
              <select
                :value="item.method"
                @change="updateItem(index, 'method', $event.target.value)"
                class="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-600"
              >
                <option
                  v-for="method in paymentMethods"
                  :key="method"
                  :value="method"
                >
                  {{ method }}
                </option>
              </select>
            </td>
            <td class="px-4 py-3">
              <input
                :value="item.date"
                @input="updateItem(index, 'date', $event.target.value)"
                type="date"
                class="w-full text-xs bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-500"
              />
            </td>
            <td class="px-4 py-3 text-center print:hidden">
              <button
                @click="$emit('remove-item', index)"
                class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
      v-if="items.length === 0"
      class="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50"
    >
      <DollarSign class="w-8 h-8 text-slate-300 mb-2" />
      <p class="text-sm font-semibold text-slate-500 mb-4">
        No payment items added yet
      </p>
      <button
        @click="$emit('add-item')"
        class="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all"
      >
        Add First Payment
      </button>
    </div>

    <!-- Summary Row -->
    <div
      v-if="items.length > 0"
      class="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      <div>
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
        >
          Total Items
        </p>
        <p class="text-lg font-black text-slate-900">{{ items.length }}</p>
      </div>
      <div>
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
        >
          Subtotal
        </p>
        <p class="text-lg font-black text-slate-900">
          {{ currency }} {{ formatCurrency(subtotal) }}
        </p>
      </div>
      <div>
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
        >
          Tax
        </p>
        <p class="text-lg font-black text-slate-900">
          {{ currency }} {{ formatCurrency(tax) }}
        </p>
      </div>
      <div>
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
        >
          Total
        </p>
        <p class="text-lg font-black text-emerald-600">
          {{ currency }} {{ formatCurrency(total) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Trash2, DollarSign } from "lucide-vue-next";
import { formatCurrency } from "../utils/formatting.js";
import { PAYMENT_METHODS } from "../utils/constants.js";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  paymentMethods: {
    type: Array,
    default: () => PAYMENT_METHODS,
  },
});

const emit = defineEmits(["add-item", "remove-item", "update-item"]);

const subtotal = props.items.reduce(
  (sum, item) => sum + (item.quantity || 1) * (item.rate || 0),
  0,
);

const tax = Math.round((subtotal * (props.taxRate || 0)) / 100);
const total = subtotal + tax;

const updateItem = (index, field, value) => {
  emit("update-item", { index, field, value });
};
</script>
