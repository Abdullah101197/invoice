<template>
  <div class="space-y-6">
    <!-- Invoice Metadata -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Invoice Number
        </label>
        <input
          :value="modelValue.id"
          @input="
            $emit('update:modelValue', {
              ...modelValue,
              id: $event.target.value,
            })
          "
          type="text"
          placeholder="INV-2024-001"
          class="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        />
      </div>

      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Issue Date
        </label>
        <input
          :value="modelValue.date"
          @input="
            $emit('update:modelValue', {
              ...modelValue,
              date: $event.target.value,
            })
          "
          type="date"
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        />
      </div>

      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Due Date
        </label>
        <input
          :value="modelValue.dueDate"
          @input="
            $emit('update:modelValue', {
              ...modelValue,
              dueDate: $event.target.value,
            })
          "
          type="date"
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        />
      </div>

      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Reference
        </label>
        <input
          :value="modelValue.reference || ''"
          @input="
            $emit('update:modelValue', {
              ...modelValue,
              reference: $event.target.value,
            })
          "
          type="text"
          placeholder="PO-12345 (optional)"
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        />
      </div>
    </div>

    <!-- Bill To -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Bill To
      </label>
      <textarea
        :value="modelValue.billTo"
        @input="
          $emit('update:modelValue', {
            ...modelValue,
            billTo: $event.target.value,
          })
        "
        rows="4"
        placeholder="Client Name&#10;Company&#10;Address&#10;City, Country"
        class="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
      />
    </div>

    <!-- Bank Details (Optional) -->
    <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
      <label
        class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
      >
        <Landmark class="w-3 h-3" />
        Bank Details (Optional)
      </label>

      <div class="grid grid-cols-2 gap-3">
        <input
          :value="modelValue.bankDetails?.accountName || ''"
          @input="
            $emit('update:bankDetails', {
              ...modelValue.bankDetails,
              accountName: $event.target.value,
            })
          "
          type="text"
          placeholder="Account Name"
          class="col-span-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-slate-900 transition-all"
        />
        <input
          :value="modelValue.bankDetails?.bankName || ''"
          @input="
            $emit('update:bankDetails', {
              ...modelValue.bankDetails,
              bankName: $event.target.value,
            })
          "
          type="text"
          placeholder="Bank Name"
          class="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-slate-900 transition-all"
        />
        <input
          :value="modelValue.bankDetails?.accountNumber || ''"
          @input="
            $emit('update:bankDetails', {
              ...modelValue.bankDetails,
              accountNumber: $event.target.value,
            })
          "
          type="text"
          placeholder="Account Number"
          class="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-slate-900 transition-all"
        />
        <input
          :value="modelValue.bankDetails?.swiftCode || ''"
          @input="
            $emit('update:bankDetails', {
              ...modelValue.bankDetails,
              swiftCode: $event.target.value,
            })
          "
          type="text"
          placeholder="SWIFT Code"
          class="col-span-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-slate-900 transition-all"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Landmark } from "lucide-vue-next";

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

defineEmits(["update:modelValue", "update:bankDetails"]);
</script>
