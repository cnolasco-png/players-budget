// Ambient type augmentation for jsPDF + jspdf-autotable
import "jspdf";
import type { jsPDF } from "jspdf";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY?: number };
  }
}

declare module "jspdf-autotable" {
  const autoTable: (doc: jsPDF, options?: unknown) => void;
  export default autoTable;
}
