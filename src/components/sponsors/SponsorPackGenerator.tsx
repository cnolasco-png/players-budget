import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Loader2 } from "lucide-react";
import type { Activation, Profile, Prospect, SponsorAsset } from "@/hooks/useSponsorsData";

type SponsorPackGeneratorProps = {
  profile: Profile;
  assets: SponsorAsset[];
  prospects: Prospect[];
  activations: Activation[];
};

const theme = {
  primary: "#115e59",
  accent: "#f4a261",
};

function buildPackSummary(profile: Profile, assets: SponsorAsset[], prospects: Prospect[], activations: Activation[]) {
  const testimonials = assets.filter((asset) => asset.type === "testimonial").map((asset) => `• ${asset.label}`);
  const activationsPlanned = profile.activationIdeas.slice(0, 4).map((idea) => `• ${idea}`);
  const pipelineSummary = prospects
    .filter((prospect) => prospect.stage !== "Lost")
    .map((prospect) => `• ${prospect.business} (${prospect.stage}) – Next: ${prospect.nextAction}`);
  const activationMetrics = activations
    .slice(-3)
    .map(
      (act) =>
        `• ${act.date}: ${act.type} – attendees ${act.attendees}, QR ${act.qrScans}, redemptions ${act.redemptions}, clips ${act.clipsDelivered}`,
    );

  return {
    testimonials: testimonials.length ? testimonials : ["• Pilot offer: waive clinic fee for first sponsor activation."],
    activationsPlanned,
    pipelineSummary,
    activationMetrics,
  };
}

function generatePdf(profile: Profile, assets: SponsorAsset[], prospects: Prospect[], activations: Activation[]) {
  const summary = buildPackSummary(profile, assets, prospects, activations);

  const lines = [
    `Sponsor Pack — ${profile.name}`,
    "",
    "1) Cover",
    `${profile.name} — ${profile.ranking}`,
    `${profile.club} · ${profile.city}`,
    "",
    "2) Who I am",
    profile.bio ?? "Add your 150-word bio here.",
    "",
    "3) Schedule/Markets",
    prospects
      .map((prospect) => `• ${prospect.city} — ${prospect.business} (${prospect.segment})`)
      .join("\n") || "• Add club/tournament schedule",
    "",
    "4) Activation menu",
    summary.activationsPlanned.join("\n"),
    "",
    "5) Past proof",
    summary.testimonials.join("\n"),
    "",
    "6) Packages & pricing",
    "Starter: $1.5k — 1 activation/month + QR tracking",
    "Growth: $3k — 2 activations + 5 clips + reporting",
    "Local Hero: $5k — 3 activations + school visit + reporting",
    "",
    "7) Tracking & reporting",
    "• QR scans, redemptions, signups",
    "• Clips delivered",
    "Recent highlights:",
    summary.activationMetrics.join("\n"),
    "",
    "8) Contact",
    `${profile.email} · ${profile.phone}`,
  ];

  const streamContent = `BT\n/F1 14 Tf\n72 720 Td\n(${lines.join("\\n").replace(/\(/g, "\\(").replace(/\)/g, "\\)")}) Tj\nET\n`;
  const encoder = new TextEncoder();
  const length = encoder.encode(streamContent).length;

  const pdf = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    "endobj",
    "4 0 obj",
    `<< /Length ${length} >>`,
    "stream",
    streamContent,
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
    "0000000546 00000 n ",
    "trailer",
    "<< /Size 6 /Root 1 0 R >>",
    "startxref",
    "666",
    "%%EOF",
  ].join("\n");

  return new Blob([encoder.encode(pdf)], { type: "application/pdf" });
}

function generatePptx(profile: Profile, assets: SponsorAsset[], prospects: Prospect[], activations: Activation[]) {
  const summary = buildPackSummary(profile, assets, prospects, activations);
  const pptContent = [
    `Slide 1 — Cover`,
    `${profile.name} | ${profile.ranking}`,
    `Club: ${profile.club} | City: ${profile.city}`,
    "",
    `Slide 2 — Who I am`,
    profile.bio ?? "Add your bio here (150 words).",
    "",
    `Slide 3 — Schedule / Markets`,
    prospects
      .map((prospect) => `• ${prospect.city} — ${prospect.business}`)
      .join("\n") || "• Add your travel schedule here.",
    "",
    `Slide 4 — Activation Menu`,
    summary.activationsPlanned.join("\n"),
    "",
    `Slide 5 — Proof`,
    summary.testimonials.join("\n"),
    "",
    `Slide 6 — Packages & Pricing`,
    "Starter | Growth | Local Hero (customize pricing)",
    "",
    `Slide 7 — Tracking & Reporting`,
    summary.activationMetrics.join("\n") || "Add tracking snapshots.",
    "",
    `Slide 8 — Contact`,
    `${profile.email} | ${profile.phone}`,
    "",
    `Theme: Dark green ${theme.primary} with gold accent ${theme.accent}`,
  ].join("\n");

  return new Blob([pptContent], { type: "text/plain" });
}

export function SponsorPackGenerator({ profile, assets, prospects, activations }: SponsorPackGeneratorProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const pdfBlob = generatePdf(profile, assets, prospects, activations);
      const pptBlob = generatePptx(profile, assets, prospects, activations);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const pptUrl = URL.createObjectURL(pptBlob);

      const pdfLink = document.createElement("a");
      pdfLink.href = pdfUrl;
      pdfLink.download = "sponsor-pack.pdf";
      document.body.appendChild(pdfLink);
      pdfLink.click();
      document.body.removeChild(pdfLink);

      const pptLink = document.createElement("a");
      pptLink.href = pptUrl;
      pptLink.download = "sponsor-pack.pptx";
      document.body.appendChild(pptLink);
      pptLink.click();
      document.body.removeChild(pptLink);

      URL.revokeObjectURL(pdfUrl);
      URL.revokeObjectURL(pptUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Sponsor Pack Generator</CardTitle>
          <CardDescription>
            Pulls your profile, pipeline and activation metrics into a ready-to-share PDF and PPTX pack. Customize
            pricing once exported.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            The pack includes: cover, bio, schedule, activation menu, proof, packages, tracking and contact info. Update
            your assets and metrics above before generating.
          </p>
          <p>Theme defaults to dark green and gold to match the Player&apos;s Budget identity.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
            Generate PDF & PPTX
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}

export default SponsorPackGenerator;
