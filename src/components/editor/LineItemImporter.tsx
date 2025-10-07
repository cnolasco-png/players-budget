import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import type { ScenarioRecord } from "@/hooks/use-budget-data";

interface ImportRow {
  scenarioId: string;
  label: string;
  qty: number;
  unitCost: number;
  unit?: string;
}

interface LineItemImporterProps {
  scenarios: ScenarioRecord[];
  isProUser: boolean;
  onUpgrade?: () => void;
  onImport: (rows: ImportRow[]) => Promise<void> | void;
}

const REQUIRED_HEADERS = ["scenario", "label", "qty", "unit_cost"];

const normalizeHeader = (value: string) => value.trim().toLowerCase();

const parseCsv = (text: string) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0]
    .split(",")
    .map((header) => normalizeHeader(header.replace(/^"|"$/g, "")));
  const rows = lines.slice(1).map((line) =>
    line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((cell) => cell.replace(/^"|"$/g, "").trim()),
  );
  return { headers, rows };
};

const LineItemImporter = ({ scenarios, isProUser, onUpgrade, onImport }: LineItemImporterProps) => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scenarioLookup = scenarios.reduce<Record<string, string>>((acc, scenario) => {
    acc[scenario.name.trim().toLowerCase()] = scenario.id;
    return acc;
  }, {});

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isProUser) {
      onUpgrade?.();
      return;
    }

    setStatus(null);
    setError(null);

    try {
      const text = await file.text();
      const { headers, rows } = parseCsv(text);

      const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
      if (missingHeaders.length) {
        throw new Error(`Missing columns: ${missingHeaders.join(", ")}`);
      }

      const scenarioIndex = headers.indexOf("scenario");
      const labelIndex = headers.indexOf("label");
      const qtyIndex = headers.indexOf("qty");
      const unitCostIndex = headers.indexOf("unit_cost");
      const unitIndex = headers.indexOf("unit");

      const mappedRows: ImportRow[] = [];
      rows.forEach((row, rowNumber) => {
        if (!row[labelIndex]) return; // skip empty
        const scenarioName = row[scenarioIndex]?.toLowerCase();
        const scenarioId = scenarioName ? scenarioLookup[scenarioName] : undefined;
        if (!scenarioId) {
          throw new Error(`Row ${rowNumber + 2}: scenario "${row[scenarioIndex]}" not found.`);
        }
        const qty = Number(row[qtyIndex] ?? 1);
        const unitCost = Number(row[unitCostIndex] ?? 0);
        if (Number.isNaN(qty) || Number.isNaN(unitCost)) {
          throw new Error(`Row ${rowNumber + 2}: qty and unit_cost must be numeric.`);
        }
        mappedRows.push({
          scenarioId,
          label: row[labelIndex],
          qty,
          unitCost,
          unit: unitIndex >= 0 ? row[unitIndex] || undefined : undefined,
        });
      });

      if (!mappedRows.length) {
        throw new Error("No rows detected in the file.");
      }

      setIsLoading(true);
      await onImport(mappedRows);
      setStatus(`${mappedRows.length} line items imported successfully.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to import file.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-semibold">Import from Sheets or Excel</h4>
          <p className="text-sm text-muted-foreground">
            Export your sheet to CSV with columns "scenario", "label", "qty", "unit_cost", and optional "unit".
          </p>
        </div>
        {!isProUser && (
          <Button variant="gold" onClick={onUpgrade}>
            Unlock integrations
          </Button>
        )}
      </div>

      {!isProUser ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Data imports are part of Player's Budget Pro. Upgrade to sync Google Sheets or Excel with your budget.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <Input type="file" accept=".csv" disabled={isLoading} onChange={handleFileChange} />
          {status && <p className="text-sm text-emerald-600">{status}</p>}
          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: In Google Sheets choose File → Download → Comma-separated values (.csv) to export your tab.
          </p>
        </div>
      )}
    </Card>
  );
};

export type { ImportRow };
export default LineItemImporter;
