import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ExportPayload } from "@/lib/exportUtils";
import { exportBudgetToCsv, exportBudgetToPdf, exportSponsorPackPdf } from "@/lib/exportUtils";
import { ArrowDownToLine, FileText } from "lucide-react";
import { useState } from "react";

interface ExportButtonsProps extends ExportPayload {
  isProUser?: boolean;
}

const ExportButtons = ({ budget, scenarios, lineItems, incomes, isProUser = false }: ExportButtonsProps) => {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<null | "pdf" | "sponsor">(null);
  const [shouldRetryCsv, setShouldRetryCsv] = useState(false);
  const [shouldRetryPdf, setShouldRetryPdf] = useState(false);
  const [shouldRetrySponsor, setShouldRetrySponsor] = useState(false);

  const notifyProOnly = (feature: string) => {
    toast({
      title: "Pro feature",
      description: `${feature} exports are available on the Pro plan. Upgrade to unlock sponsor-ready downloads.`,
    });
  };

  const handleCsvExport = () => {
    setShouldRetryCsv(false);
    if (!isProUser) {
      notifyProOnly("CSV");
      return;
    }
    try {
      exportBudgetToCsv({ budget, scenarios, lineItems, incomes });
      toast({
        title: "Export ready",
        description: "Your CSV download has started.",
      });
      setShouldRetryCsv(false);
    } catch (error) {
      console.error("CSV export failed", error);
      toast({
        title: "Export failed",
        description: `${(error as Error).message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setShouldRetryCsv(true);
    }
  };

  const handlePdfExport = async () => {
    try {
      setLoadingAction("pdf");
      setShouldRetryPdf(false);
      if (!isProUser) {
        notifyProOnly("PDF");
        return;
      }
      await exportBudgetToPdf({ budget, scenarios, lineItems, incomes });
      toast({
        title: "PDF generated",
        description: "Check your downloads folder for the budget PDF.",
      });
      setShouldRetryPdf(false);
    } catch (error) {
      console.error("PDF export failed", error);
      toast({
        title: "Export failed",
        description: `${(error as Error).message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setShouldRetryPdf(true);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSponsorPack = async () => {
    try {
      setLoadingAction("sponsor");
      setShouldRetrySponsor(false);
      if (!isProUser) {
        notifyProOnly("Sponsor pack");
        return;
      }
      await exportSponsorPackPdf({ budget, scenarios, lineItems, incomes });
      toast({
        title: "Sponsor pack ready",
        description: "Download complete. Share it with prospective partners!",
      });
    } catch (error) {
      console.error("Sponsor pack export failed", error);
      toast({
        title: "Export failed",
        description: `${(error as Error).message}. Check your internet connection and try again.`,
        variant: "destructive",
      });
      setShouldRetrySponsor(true);
    } finally {
      setLoadingAction(null);
    }
  };

  const retryCsvExport = () => handleCsvExport();
  const retryPdfExport = () => handlePdfExport();

  return (
    <div className="flex flex-col gap-3">
      {(shouldRetryCsv || shouldRetryPdf) && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>Export didn’t finish. Check your connection and retry.</span>
          <div className="flex gap-2">
            {shouldRetryCsv && (
              <Button variant="outline" size="sm" onClick={retryCsvExport}>
                Retry CSV
              </Button>
            )}
            {shouldRetryPdf && (
              <Button variant="outline" size="sm" onClick={retryPdfExport}>
                Retry PDF
              </Button>
            )}
            {shouldRetrySponsor && (
              <Button variant="outline" size="sm" onClick={handleSponsorPack}>
                Retry pack
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleCsvExport}
          aria-disabled={!isProUser}
          className={isProUser ? undefined : "opacity-60 hover:opacity-50"}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Export CSV
        </Button>
        <Button
          variant="gold"
          onClick={handlePdfExport}
          disabled={loadingAction === "pdf"}
          aria-disabled={!isProUser}
          className={isProUser ? undefined : "opacity-60 hover:opacity-50"}
        >
          <FileText className="mr-2 h-4 w-4" />
          {loadingAction === "pdf" ? "Generating..." : "Export PDF (Pro)"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSponsorPack}
          disabled={loadingAction === "sponsor"}
          aria-disabled={!isProUser}
          className={isProUser ? undefined : "opacity-60 hover:opacity-50"}
        >
          {loadingAction === "sponsor" ? "Building pack..." : "Sponsor pack (Pro)"}
        </Button>
      </div>
      {!isProUser && (
        <p className="text-xs text-primary/70">Renew Pro to download sponsor-ready sheets.</p>
      )}
    </div>
  );
};

export default ExportButtons;
