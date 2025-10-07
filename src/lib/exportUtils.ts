import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import type {
  BudgetRecord,
  IncomeRecord,
  LineItemRecord,
  ScenarioRecord,
} from "@/hooks/use-budget-data";

interface ExportPayload {
  budget: BudgetRecord;
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  incomes: IncomeRecord[];
}

function triggerDownload(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportBudgetToCsv(payload: ExportPayload) {
  const { budget, scenarios, lineItems, incomes } = payload;
  const scenarioTotals = calculateScenarioTotals(scenarios, lineItems);
  const header = ["Section", "Name", "Details", "Amount"];
  const rows: string[][] = [];

  rows.push(["Budget", "Title", budget.title, ""]);
  rows.push(["Budget", "Season", String(budget.season_year), ""]);
  rows.push(["Budget", "Tax Country", budget.tax_country ?? "-", ""]);
  rows.push(["Budget", "Tax %", budget.tax_pct ? `${budget.tax_pct}%` : "0", ""]);
  rows.push([]);

  rows.push(["Income", "Label", "Type", "Monthly Amount"]);
  incomes.forEach((income) =>
    rows.push([
      "Income",
      income.label,
      income.type ?? "Recurring",
      formatCurrency(income.amount_monthly ?? 0, income.currency ?? budget.base_currency ?? "USD"),
    ]),
  );
  rows.push([]);

  rows.push(["Scenario", "Name", "Monthly Total", "Currency"]);
  scenarioTotals.forEach((entry) =>
    rows.push([
      "Scenario",
      entry.scenario.name,
      formatCurrency(entry.total, budget.base_currency ?? "USD"),
      budget.base_currency ?? "USD",
    ]),
  );
  rows.push([]);

  rows.push(["Line Items", "Label", "Qty x Unit", "Scenario"]);
  lineItems.forEach((item) => {
    const scenarioName = scenarios.find((scenario) => scenario.id === item.scenario_id)?.name ?? "";
    const qty = item.qty ?? 1;
    const unitCost = item.unit_cost ?? 0;
    rows.push([
      "Line Item",
      item.label,
      `${qty} x ${formatCurrency(unitCost, item.currency ?? budget.base_currency ?? "USD")}`,
      scenarioName,
    ]);
  });

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
    .join("\n");

  triggerDownload(`${budget.title.replace(/\s+/g, "-")}-budget.csv`, csvContent, "text/csv;charset=utf-8;");
}

async function loadPdfLibraries() {
  return Promise.all([import("jspdf"), import("jspdf-autotable")]);
}

export async function exportBudgetToPdf(payload: ExportPayload) {
  const { budget, scenarios, lineItems, incomes } = payload;
  const [{ default: jsPDF }, { default: autoTable }] = await loadPdfLibraries();
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const currency = budget.base_currency ?? "USD";
  const scenarioTotals = calculateScenarioTotals(scenarios, lineItems);

  doc.setFontSize(18);
  doc.text("Player's Budget", 40, 50);
  doc.setFontSize(12);
  doc.text(`${budget.title} – Season ${budget.season_year}`, 40, 70);

  autoTable(doc, {
    startY: 90,
    head: [["Scenario", "Monthly Total"]],
    body: scenarioTotals.map((entry) => [entry.scenario.name, formatCurrency(entry.total, currency)]),
    styles: { fontSize: 10 },
    theme: "grid",
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Income Source", "Type", "Monthly Amount"]],
    body: incomes.map((income) => [
      income.label,
      income.type ?? "Recurring",
      formatCurrency(income.amount_monthly ?? 0, income.currency ?? currency),
    ]),
    styles: { fontSize: 10 },
    theme: "grid",
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Scenario", "Line Item", "Qty", "Unit Cost", "Monthly"]],
    body: lineItems.map((item) => {
      const scenarioName = scenarios.find((scenario) => scenario.id === item.scenario_id)?.name ?? "";
      const qty = item.qty ?? 1;
      const unit = item.unit_cost ?? 0;
      return [
        scenarioName,
        item.label,
        String(qty),
        formatCurrency(unit, item.currency ?? currency),
        formatCurrency(qty * unit, item.currency ?? currency),
      ];
    }),
    styles: { fontSize: 9 },
    theme: "grid",
  });

  doc.save(`${budget.title.replace(/\s+/g, "-")}-budget.pdf`);
}

export async function exportSponsorPackPdf(payload: ExportPayload) {
  const { budget, scenarios, lineItems, incomes } = payload;
  const [{ default: jsPDF }, { default: autoTable }] = await loadPdfLibraries();
  const currency = budget.base_currency ?? "USD";
  const scenarioTotals = calculateScenarioTotals(scenarios, lineItems);
  const totalIncome = incomes.reduce((sum, income) => sum + (income.amount_monthly ?? 0), 0);
  const totalSpend = scenarioTotals.reduce((sum, entry) => sum + entry.total, 0);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // Cover page
  doc.setFillColor(18, 18, 61);
  doc.rect(0, 0, 612, 180, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.text("Player's Budget", 40, 80);
  doc.setFontSize(16);
  doc.text(`${budget.title} – Sponsor Pack`, 40, 110);
  doc.setFontSize(12);
  doc.text(`Season ${budget.season_year}`, 40, 135);
  doc.setTextColor(34, 34, 34);
  doc.text(
    `Monthly spend: ${formatCurrency(totalSpend, currency)} | Monthly funding: ${formatCurrency(totalIncome, currency)}`,
    40,
    220,
  );
  doc.text(`Tax country: ${budget.tax_country ?? "Not set"} • Currency: ${currency}`, 40, 240);

  // Scenario summary
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Scenario Overview", 40, 60);
  autoTable(doc, {
    startY: 80,
    head: [["Scenario", "Monthly Total", "% of Spend"]],
    body: scenarioTotals.map((entry) => [
      entry.scenario.name,
      formatCurrency(entry.total, currency),
      `${((entry.total / totalSpend) * 100 || 0).toFixed(1)}%`,
    ]),
    styles: { fontSize: 11, cellPadding: { top: 6, bottom: 6 } },
    theme: "striped",
  });

  // Top expenses
  const sortedLineItems = [...lineItems]
    .map((item) => ({
      scenarioName: scenarios.find((scenario) => scenario.id === item.scenario_id)?.name ?? "",
      label: item.label,
      spend: (item.qty ?? 1) * (item.unit_cost ?? 0),
      unit: item.unit,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8);

  doc.addPage();
  doc.setFontSize(18);
  doc.text("Key Spending Highlights", 40, 60);
  autoTable(doc, {
    startY: 80,
    head: [["Scenario", "Line Item", "Monthly Spend", "Unit"]],
    body: sortedLineItems.map((item) => [
      item.scenarioName,
      item.label,
      formatCurrency(item.spend, currency),
      item.unit ?? "flat",
    ]),
    styles: { fontSize: 10 },
    theme: "grid",
  });

  // Income outlook
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Funding Outlook", 40, 60);
  autoTable(doc, {
    startY: 80,
    head: [["Source", "Type", "Monthly Amount"]],
    body: incomes.map((income) => [
      income.label,
      income.type ?? "Recurring",
      formatCurrency(income.amount_monthly ?? 0, income.currency ?? currency),
    ]),
    styles: { fontSize: 10 },
    theme: "grid",
  });

  const gap = totalSpend - totalIncome;
  doc.setFontSize(12);
  doc.text(
    gap > 0
      ? `Current funding gap: ${formatCurrency(gap, currency)} per month`
      : `Surplus funds: ${formatCurrency(Math.abs(gap), currency)} per month`,
    40,
    doc.lastAutoTable.finalY + 24,
  );

  doc.text("Callouts", 40, doc.lastAutoTable.finalY + 56);
  const bulletPoints = [
    scenarioTotals[0]
      ? `Top scenario: ${scenarioTotals[0].scenario.name} at ${formatCurrency(scenarioTotals[0].total, currency)}.`
      : "Top scenario data unavailable.",
    sortedLineItems[0]
      ? `Largest spend: ${sortedLineItems[0].label} (${formatCurrency(sortedLineItems[0].spend, currency)}).`
      : "Largest spend item unavailable.",
    `Monthly funding: ${formatCurrency(totalIncome, currency)} supporting ${scenarios.length} scenarios.`,
  ];
  doc.setFontSize(11);
  bulletPoints.forEach((point, index) => {
    doc.text(`• ${point}`, 60, doc.lastAutoTable.finalY + 80 + index * 18);
  });

  doc.save(`${budget.title.replace(/\s+/g, "-")}-sponsor-pack.pdf`);
}

export type { ExportPayload };
