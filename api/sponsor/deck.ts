const VARIANT_COPY: Record<
  string,
  { title: string; subtitle: string; instruction: string }
> = {
  local: {
    title: "Local Partner Deck Placeholder",
    subtitle: "Tailor this for clinics, gyms and community businesses.",
    instruction: "Upload your final PDF to public/sponsor/templates/local-starter.pdf.",
  },
  consumer: {
    title: "Consumer Brand Deck Placeholder",
    subtitle: "Highlight conversion metrics and product launch ideas.",
    instruction: "Upload your final PDF to public/sponsor/templates/consumer-brand-deck.pdf.",
  },
  enterprise: {
    title: "Enterprise Hospitality Deck Placeholder",
    subtitle: "Focus on hospitality, VIP experiences and media reach.",
    instruction: "Upload your final PDF to public/sponsor/templates/enterprise-partner-deck.pdf.",
  },
};

function escapePdf(input: string) {
  return input.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// Vercel Serverless Function: returns a small valid PDF for Sponsor Deck
export default async function handler(req: any, res: any) {
  const rawVariant =
    req.query?.variant ??
    (req.body && typeof req.body === "object" ? (req.body.variant as string | undefined) : undefined);
  const variant = typeof rawVariant === "string" ? rawVariant.toLowerCase() : "default";

  const copy =
    VARIANT_COPY[variant] ?? {
      title: "Sponsor Deck Template Placeholder",
      subtitle: "Replace this with your real deck PDF.",
      instruction: "Upload a custom PDF to public/sponsor/ and redeploy.",
    };

  const lines = [
    `( ${escapePdf(copy.title)} ) Tj`.replace(/^ \(/, "("),
    `0 -24 Td`,
    `(${escapePdf(copy.subtitle)}) Tj`,
    `0 -24 Td`,
    `(${escapePdf(copy.instruction)}) Tj`,
  ];

  const streamContent = `BT\n/F1 18 Tf\n72 720 Td\n${lines.join("\n")}\nET\n`;
  const length = Buffer.byteLength(streamContent, "utf8");

  const pdf = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "endobj",
    "4 0 obj",
    `<< /Length ${length} >>`,
    "stream",
    streamContent.trimEnd(),
    "endstream",
    "endobj",
    "5 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000010 00000 n ",
    "0000000063 00000 n ",
    "0000000126 00000 n ",
    "0000000329 00000 n ",
    "0000000531 00000 n ",
    "trailer",
    "<< /Size 6 /Root 1 0 R >>",
    "startxref",
    "604",
    "%%EOF",
  ].join("\n");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="sponsor-deck.pdf"');
  res.status(200).send(Buffer.from(pdf, "utf8"));
}
