// Ambient type augmentation for jsPDF + jspdf-autotable
import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY?: number };
  }
}

declare module "jspdf-autotable" {
  const autoTable: (doc: any, options?: any) => void;
  export default autoTable;
}
