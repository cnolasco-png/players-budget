// Vercel Serverless Function: returns a small PDF containing the 7-Day Action Plan placeholder
export default async function handler(req: any, res: any) {
  const plan = `Professional 7-Day Action Plan\n\nDay 1 – Positioning & Proof\nDay 2 – Assets\nDay 3 – Target List\nDay 4 – Outreach System\nDay 5 – Offers\nDay 6 – Pipeline\nDay 7 – Review & Iterate`;
  const content = plan.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(${content}) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000063 00000 n \n0000000126 00000 n \n0000000330 00000 n \n0000000543 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n616\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="action-plan-pro.pdf"');
  res.status(200).send(Buffer.from(pdf, 'utf8'));
}
