<template>
  <div class="space-y-6">
    <!-- Company Logo & Details -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          Company Logo
        </label>
        <button
          v-if="logoUrl"
          @click="$emit('remove-logo')"
          class="text-xs text-slate-500 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>

      <div class="relative w-24 h-24 group cursor-pointer">
        <input
          type="file"
          @change="$emit('logo-uploaded', $event)"
          accept="image/*"
          class="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div
          class="w-full h-full rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100 group-hover:border-slate-400 group-hover:bg-slate-50 transition-all overflow-hidden"
        >
          <img
            v-if="logoUrl"
            :src="logoUrl"
            class="w-full h-full object-contain"
            alt="Company logo"
          />
          <div v-else class="flex flex-col items-center gap-1">
            <Upload class="w-6 h-6 text-slate-400" />
            <span class="text-[10px] text-slate-500 font-medium">Upload</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Details -->
    <div class="space-y-3">
      <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Your Details
      </label>
      <textarea
        :value="modelValue.from"
        @input="
          $emit('update:modelValue', {
            ...modelValue,
            from: $event.target.value,
          })
        "
        rows="4"
        placeholder="Company Name&#10;Address&#10;City, Country&#10;Email&#10;Phone"
        class="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all resize-none"
      />
    </div>

    <!-- Quick Settings -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Currency
        </label>
        <select
          :value="modelValue.currency"
          @change="
            $emit('update:modelValue', {
              ...modelValue,
              currency: $event.target.value,
            })
          "
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        >
          <option
            v-for="curr in currencies"
            :key="curr.code"
            :value="curr.code"
          >
            {{ curr.code }} - {{ curr.name }}
          </option>
        </select>
      </div>

      <div>
        <label
          class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2"
        >
          Payment Terms
        </label>
        <select
          :value="modelValue.paymentTerms"
          @change="
            $emit('update:modelValue', {
              ...modelValue,
              paymentTerms: $event.target.value,
            })
          "
          class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 transition-all"
        >
          <option v-for="term in paymentTerms" :key="term" :value="term">
            {{ term }}
          </option>
        </select>
      </div>
    </div>

    <!-- WhatsApp Number -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">
        WhatsApp Number (Optional)
      </label>
      <input
        :value="modelValue.whatsappNumber"
        @input="
          $emit('update:modelValue', {
            ...modelValue,
            whatsappNumber: $event.target.value,
          })
        "
        type="tel"
        placeholder="+92 300 1234567"
        class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
      />
      <p class="text-[10px] text-slate-500">
        For sending invoice directly via WhatsApp
      </p>
    </div>
  </div>
</template>

<script setup>
import { Upload } from "lucide-vue-next";
import { CURRENCIES, PAYMENT_TERMS } from "../utils/constants.js";

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  logoUrl: String,
  currencies: {
    type: Array,
    default: () => CURRENCIES,
  },
  paymentTerms: {
    type: Array,
    default: () => PAYMENT_TERMS,
  },
});

defineEmits(["update:modelValue", "logo-uploaded", "remove-logo"]);
</script>
