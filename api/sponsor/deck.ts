// Vercel Serverless Function: returns a small valid PDF for Sponsor Deck
export default async function handler(req: any, res: any) {
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n72 720 Td\n(Sponsor Deck Template Placeholder) Tj\n0 -24 Td\n(Replace this with your real deck PDF.) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000063 00000 n \n0000000126 00000 n \n0000000329 00000 n \n0000000531 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n604\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="sponsor-deck.pdf"');
  res.status(200).send(Buffer.from(pdf, 'utf8'));
}
