<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="p-2.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-white shadow-lg"
        >
          <Zap class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900">Invoice Generator</h1>
          <p class="text-xs text-slate-500 font-medium">
            Professional SaaS Invoice Tool
          </p>
        </div>
      </div>
      <div
        class="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full"
      >
        <Shield class="w-3 h-3" />
        <span>Secure & Private</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3 print:hidden">
      <button @click="$emit('save-history')" class="btn-secondary gap-2">
        <Save class="w-4 h-4" />
        Save to History
      </button>
      <button @click="$emit('export-csv')" class="btn-secondary gap-2">
        <Download class="w-4 h-4" />
        Export CSV
      </button>
      <button @click="$emit('export-json')" class="btn-secondary gap-2">
        <FileJson class="w-4 h-4" />
        Export JSON
      </button>
      <button @click="$emit('settings')" class="btn-secondary gap-2 ml-auto">
        <Settings class="w-4 h-4" />
        Settings
      </button>
    </div>

    <!-- Info Banner -->
    <div
      class="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
    >
      <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-semibold text-blue-900">Draft Mode</p>
        <p class="text-xs text-blue-700 mt-1">
          Your invoice is auto-saved. Generate final PDF when ready.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Save,
  Download,
  FileJson,
  Settings,
  Info,
  Zap,
  Shield,
} from "lucide-vue-next";

defineEmits(["save-history", "export-csv", "export-json", "settings"]);
</script>

<style scoped>
.btn-secondary {
  @apply flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
