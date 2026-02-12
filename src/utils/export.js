/**
 * PDF export utilities
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const PDFExportService = {
  /**
   * Generate PDF from HTML element
   */
  async generatePDF(element, invoiceId) {
    try {
      if (!element) {
        throw new Error("Invoice element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Add multiple pages if needed
      let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
      let position = 0;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      return pdf;
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error(
        "Failed to generate PDF: " + (error.message || "Unknown error"),
      );
    }
  },

  /**
   * Download PDF as file
   */
  async downloadPDF(element, invoiceId) {
    try {
      const pdf = await this.generatePDF(element, invoiceId);
      const fileName = `Invoice_${invoiceId}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error("PDF download error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate and get PDF blob (for sending via email, etc.)
   */
  async generatePDFBlob(element, invoiceId) {
    try {
      const pdf = await this.generatePDF(element, invoiceId);
      return pdf.output("blob");
    } catch (error) {
      console.error("PDF blob generation error:", error);
      throw error;
    }
  },
};

/**
 * Alternative export formats
 */
export const ExportService = {
  /**
   * Export as CSV
   */
  exportAsCSV(invoiceData) {
    try {
      let csv = `Invoice #,Date,Due Date,Bill To,Total,Status\n`;
      csv += `"${invoiceData.id}","${invoiceData.date}","${invoiceData.dueDate}","${invoiceData.billTo.replace(/\n/g, " ")}","${invoiceData.projectTotal}","UNPAID"\n`;

      csv += `\n\nPayment Items\n`;
      csv += `Description,Amount,Method,Date\n`;
      invoiceData.items.forEach((item) => {
        csv += `"${item.description}","${item.amount}","${item.method}","${item.date}"\n`;
      });

      return csv;
    } catch (error) {
      console.error("CSV export error:", error);
      throw error;
    }
  },

  /**
   * Download CSV
   */
  downloadCSV(invoiceData) {
    try {
      const csv = this.exportAsCSV(invoiceData);
      const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Invoice_${invoiceData.id}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    } catch (error) {
      console.error("CSV download error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export as JSON
   */
  exportAsJSON(invoiceData) {
    try {
      return JSON.stringify(invoiceData, null, 2);
    } catch (error) {
      console.error("JSON export error:", error);
      throw error;
    }
  },

  /**
   * Download JSON
   */
  downloadJSON(invoiceData) {
    try {
      const json = this.exportAsJSON(invoiceData);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Invoice_${invoiceData.id}_${new Date().toISOString().split("T")[0]}.json`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    } catch (error) {
      console.error("JSON download error:", error);
      return { success: false, error: error.message };
    }
  },
};
