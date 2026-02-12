/**
 * Local storage utilities for invoice management
 */

const STORAGE_KEYS = {
  CURRENT_INVOICE: "saas-invoice-current",
  INVOICE_HISTORY: "saas-invoice-history",
  INVOICE_TEMPLATES: "saas-invoice-templates",
  COMPANY_DETAILS: "saas-company-details",
};

export const StorageService = {
  /**
   * Save current invoice data
   */
  saveCurrentInvoice(invoiceData) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_INVOICE,
        JSON.stringify(invoiceData),
      );
      return true;
    } catch (error) {
      console.error("Failed to save invoice:", error);
      return false;
    }
  },

  /**
   * Load current invoice data
   */
  loadCurrentInvoice() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INVOICE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load invoice:", error);
      return null;
    }
  },

  /**
   * Add invoice to history
   */
  addToHistory(invoiceData) {
    try {
      const history = this.getHistory();
      history.unshift({
        ...invoiceData,
        savedAt: new Date().toISOString(),
        id: invoiceData.id,
      });
      // Keep only last 50 invoices
      if (history.length > 50) {
        history.pop();
      }
      localStorage.setItem(
        STORAGE_KEYS.INVOICE_HISTORY,
        JSON.stringify(history),
      );
      return true;
    } catch (error) {
      console.error("Failed to add to history:", error);
      return false;
    }
  },

  /**
   * Get invoice history
   */
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICE_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load history:", error);
      return [];
    }
  },

  /**
   * Get specific invoice from history
   */
  getFromHistory(invoiceId) {
    const history = this.getHistory();
    return history.find((inv) => inv.id === invoiceId);
  },

  /**
   * Delete from history
   */
  deleteFromHistory(invoiceId) {
    try {
      const history = this.getHistory();
      const filtered = history.filter((inv) => inv.id !== invoiceId);
      localStorage.setItem(
        STORAGE_KEYS.INVOICE_HISTORY,
        JSON.stringify(filtered),
      );
      return true;
    } catch (error) {
      console.error("Failed to delete from history:", error);
      return false;
    }
  },

  /**
   * Save company details template
   */
  saveCompanyDetails(companyData) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.COMPANY_DETAILS,
        JSON.stringify(companyData),
      );
      return true;
    } catch (error) {
      console.error("Failed to save company details:", error);
      return false;
    }
  },

  /**
   * Load company details
   */
  loadCompanyDetails() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY_DETAILS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load company details:", error);
      return null;
    }
  },

  /**
   * Clear all data (use with caution)
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Failed to clear storage:", error);
      return false;
    }
  },

  /**
   * Export data as JSON
   */
  exportData() {
    return {
      current: this.loadCurrentInvoice(),
      history: this.getHistory(),
      company: this.loadCompanyDetails(),
      exportedAt: new Date().toISOString(),
    };
  },

  /**
   * Import data from JSON
   */
  importData(jsonData) {
    try {
      if (jsonData.current) {
        this.saveCurrentInvoice(jsonData.current);
      }
      if (jsonData.history && Array.isArray(jsonData.history)) {
        jsonData.history.forEach((inv) => this.addToHistory(inv));
      }
      if (jsonData.company) {
        this.saveCompanyDetails(jsonData.company);
      }
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  },
};
