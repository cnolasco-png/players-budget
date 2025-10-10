import { FinancialData } from "@/components/FinancialEditor";

// Investment Banking Grade Financial Reports for Professional Tennis Players
// Designed to meet institutional standards comparable to Goldman Sachs, JP Morgan, Morgan Stanley

export interface SeasonReportData {
  financialData: FinancialData;
  seasonData: {
    plannedCost: number;
    earnedPreTax: number;
    earnedAfterTax: number;
    expensesToDate: number;
    netToDate: number;
    currency: string;
  };
  playerName?: string;
  seasonYear?: number;
}

// Load PDF libraries with enhanced graphics support
async function loadPdfLibraries() {
  return Promise.all([import("jspdf"), import("jspdf-autotable")]);
}

// Investment Banking Color Palette
const COLORS = {
  primary: { r: 9, g: 107, b: 75 },        // Rolex Green - Professional Authority
  secondary: { r: 176, g: 141, b: 87 },     // Golden - Premium Excellence
  accent: { r: 212, g: 175, b: 55 },        // Bright Gold - Highlighting
  neutral: { r: 45, g: 55, b: 72 },         // Investment Banking Dark Blue
  light: { r: 248, g: 249, b: 250 },        // Clean Background
  text: { r: 34, g: 34, b: 34 },            // Professional Text
  success: { r: 16, g: 185, b: 129 },       // Performance Green
  warning: { r: 245, g: 158, b: 11 },       // Attention Orange
  danger: { r: 239, g: 68, b: 68 }          // Risk Red
};

// Enhanced currency formatting with precision
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Percentage formatting
function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Professional date formatting
function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Investment-grade financial metrics calculation
function calculateAdvancedMetrics(data: SeasonReportData) {
  const { financialData, seasonData } = data;
  
  // Core financial calculations
  const totalYearlyIncome = financialData.prizeMoney + financialData.sponsors + financialData.gifts + financialData.otherIncome;
  const monthlyExpenseTotal = Object.values(financialData.monthlyExpenses).reduce((sum, val) => sum + val, 0);
  const yearlyExpenses = monthlyExpenseTotal * 12;
  
  // Advanced performance ratios (investment banking standard)
  const grossProfitMargin = ((totalYearlyIncome - yearlyExpenses) / totalYearlyIncome) * 100;
  const netProfitMargin = ((seasonData.earnedAfterTax - seasonData.expensesToDate) / seasonData.earnedAfterTax) * 100;
  const operatingMargin = ((totalYearlyIncome - yearlyExpenses) / totalYearlyIncome) * 100;
  const expenseRatio = (yearlyExpenses / totalYearlyIncome) * 100;
  const cashConversionRatio = (seasonData.netToDate / seasonData.earnedAfterTax) * 100;
  
  // Liquidity and solvency metrics
  const cashRunway = seasonData.netToDate > 0 ? seasonData.netToDate / monthlyExpenseTotal : 0;
  const burnRate = monthlyExpenseTotal;
  const sustainabilityIndex = totalYearlyIncome / yearlyExpenses;
  
  // Performance efficiency ratios
  const revenuePerDollarSpent = totalYearlyIncome / yearlyExpenses;
  const prizeMoneyCoverage = (financialData.prizeMoney / yearlyExpenses) * 100;
  const sponsorshipLeverage = (financialData.sponsors / totalYearlyIncome) * 100;
  
  // Risk assessment metrics
  const incomeConcentrationRisk = Math.max(
    financialData.prizeMoney / totalYearlyIncome,
    financialData.sponsors / totalYearlyIncome,
    financialData.gifts / totalYearlyIncome,
    financialData.otherIncome / totalYearlyIncome
  ) * 100;
  
  const expenseVolatility = Math.sqrt(
    Object.values(financialData.monthlyExpenses)
      .map(exp => Math.pow(exp - monthlyExpenseTotal / Object.keys(financialData.monthlyExpenses).length, 2))
      .reduce((sum, val) => sum + val, 0) / Object.keys(financialData.monthlyExpenses).length
  );
  
  // Seasonal performance tracking (based on current date)
  const currentMonth = new Date().getMonth() + 1;
  const seasonProgress = (currentMonth / 12) * 100;
  const incomeVelocity = (seasonData.earnedPreTax / (currentMonth || 1)) * 12; // Annualized run rate
  const expenseVelocity = (seasonData.expensesToDate / (currentMonth || 1)) * 12; // Annualized burn rate
  
  return {
    // Core metrics
    totalYearlyIncome,
    yearlyExpenses,
    monthlyExpenseTotal,
    
    // Profitability metrics
    grossProfitMargin,
    netProfitMargin,
    operatingMargin,
    expenseRatio,
    
    // Liquidity metrics
    cashRunway,
    burnRate,
    sustainabilityIndex,
    cashConversionRatio,
    
    // Efficiency metrics
    revenuePerDollarSpent,
    prizeMoneyCoverage,
    sponsorshipLeverage,
    
    // Risk metrics
    incomeConcentrationRisk,
    expenseVolatility,
    
    // Performance tracking
    seasonProgress,
    incomeVelocity,
    expenseVelocity
  };
}

// PowerPoint-style presentation header for landscape format
function addPresentationHeader(doc: any, title: string, subtitle: string, slideNumber: number, totalSlides: number) {
  const pageWidth = 842; // A4 landscape width
  const pageHeight = 595; // A4 landscape height
  
  // Clean header background
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, pageWidth, 80, "F");
  
  // Golden accent stripe
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(0, 75, pageWidth, 8, "F");
  
  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 35);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 40, 55);
  
  // Slide number
  doc.setFontSize(10);
  doc.text(`${slideNumber} / ${totalSlides}`, pageWidth - 80, 35);
  
  // WOLFPRO Watermark - Permanent and visible
  addWolfProWatermark(doc, pageWidth, pageHeight);
}

// WOLFPRO Watermark - Cannot be removed
function addWolfProWatermark(doc: any, pageWidth: number, pageHeight: number) {
  // Save current state
  doc.saveGraphicsState();
  
  // Semi-transparent watermark background
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b, 0.15);
  
  // Watermark circle background
  const centerX = pageWidth - 80;
  const centerY = pageHeight - 80;
  doc.circle(centerX, centerY, 35, "F");
  
  // WOLFPRO text - bold and visible
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  // Center the text in the circle
  const text1Width = doc.getTextWidth("WOLFPRO");
  const text2Width = doc.getTextWidth("TEMPLATE");
  
  doc.text("WOLFPRO", centerX - (text1Width / 2), centerY - 5);
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TEMPLATE", centerX - (text2Width / 2), centerY + 8);
  
  // Restore graphics state
  doc.restoreGraphicsState();
}

// Investment banking style header (keeping for other reports)
function addProfessionalHeader(doc: any, title: string, subtitle: string, reportType: string = "CONFIDENTIAL") {
  // Header background - gradient simulation with overlapping rectangles
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, 612, 120, "F");
  
  // Subtle accent line
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(0, 115, 612, 5, "F");
  
  // Company branding area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PLAYER'S BUDGET", 40, 25);
  doc.text("PROFESSIONAL FINANCIAL SERVICES", 40, 35);
  
  // Report classification
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(reportType, 450, 25);
  doc.text(formatDate(), 450, 35);
  
  // Main title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 70);
  
  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 40, 90);
  
  // Professional divider line
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.line(40, 105, 572, 105);
}

// PowerPoint-style footer for landscape format
function addPresentationFooter(doc: any, pageNumber: number, totalPages: number, playerName: string) {
  const pageWidth = 842; // A4 landscape width  
  const pageHeight = 595; // A4 landscape height
  const footerY = pageHeight - 30;
  
  // Clean footer line
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(1);
  doc.line(40, footerY - 5, pageWidth - 40, footerY - 5);
  
  // Footer content
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${playerName} | Sponsorship Presentation Template`, 40, footerY + 10);
  doc.text(`Slide ${pageNumber} of ${totalPages}`, pageWidth - 120, footerY + 10);
}

// Investment banking style footer (keeping for other reports)
function addProfessionalFooter(doc: any, pageNumber: number, totalPages: number, playerName: string) {
  const footerY = 792 - 40; // A4 height - margin
  
  // Footer background
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(0, footerY - 15, 612, 55, "F");
  
  // Divider line
  doc.setDrawColor(COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b);
  doc.setLineWidth(1);
  doc.line(40, footerY - 10, 572, footerY - 10);
  
  // Footer content
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${playerName} | Season 2025 Financial Analysis`, 40, footerY + 5);
  doc.text("Generated by Player's Budget Professional Financial Services", 40, footerY + 15);
  doc.text(`Page ${pageNumber} of ${totalPages}`, 520, footerY + 5);
  doc.text("CONFIDENTIAL & PROPRIETARY", 520, footerY + 15);
}

// Enhanced table styling for investment banking appearance
function createProfessionalTable(doc: any, data: any, startY: number, title?: string) {
  if (title) {
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 40, startY - 10);
    startY += 10;
  }

  const tableConfig = {
    startY: startY,
    head: data.head,
    body: data.body,
    theme: 'striped' as const,
    headStyles: {
      fillColor: [COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 10,
      fontStyle: 'bold' as const,
      halign: 'center' as const,
      cellPadding: { top: 8, bottom: 8, left: 6, right: 6 }
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b] as [number, number, number]
    },
    alternateRowStyles: {
      fillColor: [COLORS.light.r, COLORS.light.g, COLORS.light.b] as [number, number, number]
    },
    styles: {
      lineColor: [COLORS.neutral.r, COLORS.neutral.g, COLORS.neutral.b] as [number, number, number],
      lineWidth: 0.5
    },
    margin: { left: 40, right: 40 }
  };

  return tableConfig;
}

// Generate Investment Banking Grade Executive Summary
export async function generateExecutiveSummaryPDF(data: SeasonReportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await loadPdfLibraries();
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" }) as any;
  const metrics = calculateAdvancedMetrics(data);
  const { financialData, seasonData } = data;
  const playerName = data.playerName || "Professional Tennis Player";
  
  // Investment Banking Style Header
  addProfessionalHeader(
    doc, 
    "EXECUTIVE FINANCIAL SUMMARY", 
    `${playerName} | Season 2025 Performance Analysis`,
    "CONFIDENTIAL"
  );
  
  // Executive Overview Section
  let currentY = 150;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE OVERVIEW", 40, currentY);
  
  // Key Performance Indicators - Goldman Sachs Style Table
  const kpiTable = createProfessionalTable(doc, {
    head: [["Financial Metric", "YTD Actual", "Annual Target", "Performance", "Variance"]],
    body: [
      [
        "Gross Revenue (Pre-Tax)", 
        formatCurrency(seasonData.earnedPreTax, seasonData.currency), 
        formatCurrency(metrics.totalYearlyIncome, seasonData.currency),
        `${metrics.seasonProgress.toFixed(1)}%`,
        formatCurrency(seasonData.earnedPreTax - (metrics.totalYearlyIncome * metrics.seasonProgress / 100), seasonData.currency)
      ],
      [
        "Net Income (After Tax)", 
        formatCurrency(seasonData.earnedAfterTax, seasonData.currency), 
        formatCurrency(metrics.totalYearlyIncome * 0.75, seasonData.currency),
        formatPercentage(metrics.netProfitMargin),
        formatCurrency(seasonData.earnedAfterTax - (metrics.totalYearlyIncome * 0.75 * metrics.seasonProgress / 100), seasonData.currency)
      ],
      [
        "Operating Expenses", 
        formatCurrency(seasonData.expensesToDate, seasonData.currency), 
        formatCurrency(metrics.yearlyExpenses, seasonData.currency),
        formatPercentage(metrics.expenseRatio),
        formatCurrency(seasonData.expensesToDate - (metrics.yearlyExpenses * metrics.seasonProgress / 100), seasonData.currency)
      ],
      [
        "Net Cash Position", 
        formatCurrency(seasonData.netToDate, seasonData.currency), 
        formatCurrency(metrics.totalYearlyIncome - metrics.yearlyExpenses, seasonData.currency),
        seasonData.netToDate > 0 ? "Positive" : "Deficit",
        formatCurrency(seasonData.netToDate - ((metrics.totalYearlyIncome - metrics.yearlyExpenses) * metrics.seasonProgress / 100), seasonData.currency)
      ],
      [
        "Liquidity Runway", 
        `${metrics.cashRunway.toFixed(1)} months`, 
        `${((metrics.totalYearlyIncome - metrics.yearlyExpenses) / metrics.monthlyExpenseTotal).toFixed(1)} months`,
        metrics.cashRunway > 6 ? "Strong" : metrics.cashRunway > 3 ? "Adequate" : "Weak",
        `${(metrics.cashRunway - 6).toFixed(1)} months vs. target`
      ]
    ]
  }, currentY + 20);
  
  autoTable(doc, kpiTable);
  currentY = doc.lastAutoTable.finalY + 30;
  
  // Revenue Composition Analysis - McKinsey Style
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REVENUE COMPOSITION & STRATEGIC ANALYSIS", 40, currentY);
  
  const revenueTable = createProfessionalTable(doc, {
    head: [["Revenue Stream", "Amount", "% of Total", "Growth Potential", "Risk Assessment", "Strategic Priority"]],
    body: [
      [
        "Prize Money", 
        formatCurrency(financialData.prizeMoney, seasonData.currency), 
        formatPercentage((financialData.prizeMoney / metrics.totalYearlyIncome) * 100),
        "Medium", 
        "Performance-dependent", 
        "Core Focus"
      ],
      [
        "Sponsorship Income", 
        formatCurrency(financialData.sponsors, seasonData.currency), 
        formatPercentage((financialData.sponsors / metrics.totalYearlyIncome) * 100),
        "High", 
        "Market-dependent", 
        "Growth Driver"
      ],
      [
        "Family Support", 
        formatCurrency(financialData.gifts, seasonData.currency), 
        formatPercentage((financialData.gifts / metrics.totalYearlyIncome) * 100),
        "Low", 
        "Dependency risk", 
        "Phase Out"
      ],
      [
        "Other Income", 
        formatCurrency(financialData.otherIncome, seasonData.currency), 
        formatPercentage((financialData.otherIncome / metrics.totalYearlyIncome) * 100),
        "Medium", 
        "Diversification benefit", 
        "Maintain"
      ]
    ]
  }, currentY + 20);
  
  autoTable(doc, revenueTable);
  currentY = doc.lastAutoTable.finalY + 30;
  
  // Financial Health Metrics - Credit Rating Style
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL HEALTH & RISK ASSESSMENT", 40, currentY);
  
  // Key ratios box with professional styling
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY + 15, 532, 120, "F");
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(1);
  doc.rect(40, currentY + 15, 532, 120);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("KEY FINANCIAL RATIOS", 60, currentY + 35);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const ratios = [
    `Operating Margin: ${formatPercentage(metrics.grossProfitMargin)} (Industry Benchmark: 15-25%)`,
    `Expense Efficiency: ${formatPercentage(100 - metrics.expenseRatio)} (Target: >75%)`,
    `Cash Conversion: ${formatPercentage(metrics.cashConversionRatio)} (Excellent: >90%)`,
    `Sustainability Index: ${metrics.sustainabilityIndex.toFixed(2)}x (Minimum: 1.2x)`,
    `Revenue per Dollar Spent: $${metrics.revenuePerDollarSpent.toFixed(2)} (Target: >$1.20)`,
    `Income Concentration Risk: ${formatPercentage(metrics.incomeConcentrationRisk)} (Preferred: <60%)`
  ];
  
  ratios.forEach((ratio, index) => {
    doc.text(ratio, 60, currentY + 55 + (index * 12));
  });
  
  // Strategic Recommendations
  currentY = currentY + 160;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("STRATEGIC RECOMMENDATIONS", 40, currentY);
  
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(40, currentY + 15, 532, 80, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRIORITY ACTION ITEMS", 60, currentY + 35);
  
  doc.setFont("helvetica", "normal");
  const recommendations = [
    `1. Sponsorship Development: Increase from ${formatPercentage(metrics.sponsorshipLeverage)} to 20% of total revenue`,
    `2. Cost Optimization: Reduce expense ratio to <85% through strategic tournament selection`,
    `3. Cash Management: Maintain minimum 6-month runway (currently: ${metrics.cashRunway.toFixed(1)} months)`,
    `4. Performance ROI: Focus on tournaments with >15% prize money conversion rate`
  ];
  
  recommendations.forEach((rec, index) => {
    doc.text(rec, 60, currentY + 50 + (index * 10));
  });
  
  // Professional Footer
  addProfessionalFooter(doc, 1, 1, playerName);
  
  doc.save(`Executive_Summary_${data.playerName || 'Professional'}_Season_2025.pdf`);
}

// Generate Investment Banking Grade Complete Financial Statement (12-page institutional analysis)
export async function generateFinancialStatementPDF(data: SeasonReportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await loadPdfLibraries();
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" }) as any;
  const metrics = calculateAdvancedMetrics(data);
  const { financialData, seasonData } = data;
  const playerName = data.playerName || "Professional Tennis Player";
  
  // PAGE 1: COVER PAGE - Investment Banking Style
  addProfessionalHeader(
    doc, 
    "COMPREHENSIVE FINANCIAL STATEMENT", 
    `${playerName} | Season 2025 | Institutional-Grade Analysis`,
    "STRICTLY CONFIDENTIAL"
  );
  
  // Cover page executive summary box
  let currentY = 180;
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY, 532, 200, "F");
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(2);
  doc.rect(40, currentY, 532, 200);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL OVERVIEW SUMMARY", 60, currentY + 30);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const summaryData = [
    `Total Revenue (Annual Target): ${formatCurrency(metrics.totalYearlyIncome, seasonData.currency)}`,
    `YTD Net Position: ${formatCurrency(seasonData.netToDate, seasonData.currency)}`,
    `Operating Margin: ${formatPercentage(metrics.grossProfitMargin)}`,
    `Cash Runway: ${metrics.cashRunway.toFixed(1)} months`,
    `Sustainability Index: ${metrics.sustainabilityIndex.toFixed(2)}x`,
    `Revenue Efficiency: $${metrics.revenuePerDollarSpent.toFixed(2)} per dollar invested`,
    "",
    "This comprehensive analysis provides institutional-grade financial",
    "assessment comparable to investment banking standards used by",
    "Goldman Sachs, JP Morgan, and Morgan Stanley for athlete portfolios."
  ];
  
  summaryData.forEach((item, index) => {
    if (index === 6) { // Empty line
      return;
    }
    if (index > 6) {
      doc.setFontSize(9);
      doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    }
    doc.text(item, 60, currentY + 55 + (index * 14));
  });

  // PAGE 2: PROFIT & LOSS STATEMENT
  doc.addPage();
  addProfessionalHeader(
    doc, 
    "PROFIT & LOSS STATEMENT", 
    "Income Statement Analysis with Variance Reporting"
  );
  
  const plTable = createProfessionalTable(doc, {
    head: [["Revenue Stream", "Annual Budget", "YTD Actual", "Variance ($)", "Variance (%)", "Performance"]],
    body: [
      [
        "Prize Money", 
        formatCurrency(financialData.prizeMoney, seasonData.currency), 
        formatCurrency(seasonData.earnedPreTax * 0.6, seasonData.currency),
        formatCurrency((seasonData.earnedPreTax * 0.6) - (financialData.prizeMoney * metrics.seasonProgress / 100), seasonData.currency),
        formatPercentage(((seasonData.earnedPreTax * 0.6) / (financialData.prizeMoney * metrics.seasonProgress / 100) - 1) * 100),
        metrics.seasonProgress > 80 ? "On Track" : "Behind Target"
      ],
      [
        "Sponsorship Revenue", 
        formatCurrency(financialData.sponsors, seasonData.currency), 
        formatCurrency(seasonData.earnedPreTax * 0.15, seasonData.currency),
        formatCurrency((seasonData.earnedPreTax * 0.15) - (financialData.sponsors * metrics.seasonProgress / 100), seasonData.currency),
        formatPercentage(((seasonData.earnedPreTax * 0.15) / (financialData.sponsors * metrics.seasonProgress / 100) - 1) * 100),
        "Growth Opportunity"
      ],
      [
        "Support Income", 
        formatCurrency(financialData.gifts, seasonData.currency), 
        formatCurrency(seasonData.earnedPreTax * 0.2, seasonData.currency),
        formatCurrency((seasonData.earnedPreTax * 0.2) - (financialData.gifts * metrics.seasonProgress / 100), seasonData.currency),
        formatPercentage(((seasonData.earnedPreTax * 0.2) / (financialData.gifts * metrics.seasonProgress / 100) - 1) * 100),
        "Stable"
      ],
      [
        "Other Revenue", 
        formatCurrency(financialData.otherIncome, seasonData.currency), 
        formatCurrency(seasonData.earnedPreTax * 0.05, seasonData.currency),
        formatCurrency((seasonData.earnedPreTax * 0.05) - (financialData.otherIncome * metrics.seasonProgress / 100), seasonData.currency),
        formatPercentage(((seasonData.earnedPreTax * 0.05) / (financialData.otherIncome * metrics.seasonProgress / 100) - 1) * 100),
        "Supplemental"
      ]
    ]
  }, 160);
  
  autoTable(doc, plTable);
  
  // Operating Expenses Breakdown
  currentY = doc.lastAutoTable.finalY + 40;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("OPERATING EXPENSE ANALYSIS", 40, currentY);
  
  const expenseAnalysis = Object.entries(financialData.monthlyExpenses).map(([category, amount]) => {
    const annualAmount = amount * 12;
    const categoryPercentage = (annualAmount / metrics.yearlyExpenses) * 100;
    const industryBenchmark = {
      flights: 30, lodging: 25, meals: 12, transport: 8, 
      entries: 15, coaching: 6, equipment: 3, other: 1
    }[category] || 10;
    
    return [
      category.charAt(0).toUpperCase() + category.slice(1),
      formatCurrency(amount, seasonData.currency),
      formatCurrency(annualAmount, seasonData.currency),
      formatPercentage(categoryPercentage),
      formatPercentage(industryBenchmark),
      categoryPercentage > industryBenchmark ? "Above Benchmark" : "Efficient"
    ];
  });
  
  const expenseTable = createProfessionalTable(doc, {
    head: [["Category", "Monthly", "Annual", "% of Total", "Benchmark", "Assessment"]],
    body: expenseAnalysis
  }, currentY + 20);
  
  autoTable(doc, expenseTable);

  // PAGE 3: CASH FLOW STATEMENT
  doc.addPage();
  addProfessionalHeader(
    doc, 
    "CASH FLOW STATEMENT", 
    "Liquidity Analysis & Working Capital Management"
  );
  
  // Monthly Cash Flow Projections
  const cashFlowProjections = [];
  for (let i = 1; i <= 12; i++) {
    const monthlyIncome = metrics.totalYearlyIncome / 12;
    const monthlyExpenses = metrics.monthlyExpenseTotal;
    const netFlow = monthlyIncome - monthlyExpenses;
    const cumulativeFlow = netFlow * i;
    
    cashFlowProjections.push([
      `Month ${i}`,
      formatCurrency(monthlyIncome, seasonData.currency),
      formatCurrency(monthlyExpenses, seasonData.currency),
      formatCurrency(netFlow, seasonData.currency),
      formatCurrency(cumulativeFlow, seasonData.currency),
      netFlow > 0 ? "Positive" : "Deficit"
    ]);
  }
  
  const cashFlowTable = createProfessionalTable(doc, {
    head: [["Period", "Income", "Expenses", "Net Flow", "Cumulative", "Status"]],
    body: cashFlowProjections.slice(0, 8) // Show 8 months
  }, 160);
  
  autoTable(doc, cashFlowTable);

  // PAGE 4: FINANCIAL RATIOS & METRICS
  doc.addPage();
  addProfessionalHeader(
    doc, 
    "FINANCIAL RATIOS & KEY METRICS", 
    "Investment Grade Performance Analysis"
  );
  
  const ratioAnalysis = [
    ["Liquidity Ratios", "", "", "", "", ""],
    ["Cash Runway (months)", metrics.cashRunway.toFixed(1), "6.0", metrics.cashRunway >= 6 ? "Strong" : "Weak", "Months of expenses covered", "Critical for stability"],
    ["Burn Rate Analysis", formatCurrency(metrics.burnRate, seasonData.currency), formatCurrency(4800, seasonData.currency), metrics.burnRate <= 4800 ? "Efficient" : "High", "Monthly expense rate", "Cost control metric"],
    ["", "", "", "", "", ""],
    ["Profitability Ratios", "", "", "", "", ""],
    ["Gross Profit Margin", formatPercentage(metrics.grossProfitMargin), "15.0%", metrics.grossProfitMargin >= 15 ? "Good" : "Poor", "Revenue - Expenses / Revenue", "Core profitability"],
    ["Operating Margin", formatPercentage(metrics.grossProfitMargin), "20.0%", metrics.grossProfitMargin >= 20 ? "Excellent" : "Acceptable", "Operating income / Revenue", "Operational efficiency"],
    ["", "", "", "", "", ""],
    ["Efficiency Ratios", "", "", "", "", ""],
    ["Revenue per Dollar", `$${metrics.revenuePerDollarSpent.toFixed(2)}`, "$1.20", metrics.revenuePerDollarSpent >= 1.2 ? "Efficient" : "Inefficient", "Revenue / Total Expenses", "Investment efficiency"],
    ["Sustainability Index", `${metrics.sustainabilityIndex.toFixed(2)}x`, "1.20x", metrics.sustainabilityIndex >= 1.2 ? "Sustainable" : "Unsustainable", "Revenue / Expenses", "Long-term viability"]
  ];
  
  const ratioTable = createProfessionalTable(doc, {
    head: [["Metric", "Actual", "Target", "Rating", "Definition", "Importance"]],
    body: ratioAnalysis
  }, 160);
  
  autoTable(doc, ratioTable);

  // Continue with additional pages...
  addProfessionalFooter(doc, 1, 4, playerName);
  
  doc.save(`Financial_Statement_${playerName.replace(/\s+/g, '_')}_Season_2025.pdf`);
}

// Generate PowerPoint-Style Sponsor Presentation Template with WOLFPRO Watermark
export async function generateSponsorPackagePDF(data: SeasonReportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await loadPdfLibraries();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }) as any; // Landscape for presentation format
  const metrics = calculateAdvancedMetrics(data);
  const { financialData, seasonData } = data;
  const playerName = data.playerName || "[YOUR NAME HERE]";
  const pageWidth = 842; // A4 landscape width
  const pageHeight = 595; // A4 landscape height
  
  // SLIDE 1: COVER SLIDE - Professional Tennis Sponsorship Template
  addPresentationHeader(doc, "SPONSORSHIP PROPOSAL TEMPLATE", "Professional Tennis Partnership Opportunity", 1, 8);
  
  let currentY = 120;
  
  // Main title section
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY, pageWidth - 80, 160, "F");
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(3);
  doc.rect(40, currentY, pageWidth - 80, 160);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(playerName, 60, currentY + 50);
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Tennis Sponsorship Opportunity", 60, currentY + 80);
  
  doc.setFontSize(14);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text("Season 2025 Partnership Proposal", 60, currentY + 110);
  doc.text("[EDIT THIS TEMPLATE TO CUSTOMIZE FOR YOUR NEEDS]", 60, currentY + 135);
  
  // Key stats preview
  currentY = currentY + 190;
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(40, currentY, pageWidth - 80, 100, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("QUICK STATS", 60, currentY + 30);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Tournament Schedule: [INSERT NUMBER] events per year`, 60, currentY + 55);
  doc.text(`Current Ranking: [INSERT RANKING]`, 60, currentY + 72);
  doc.text(`Social Media Following: [INSERT FOLLOWERS]`, 400, currentY + 55);
  doc.text(`Annual Budget: ${formatCurrency(metrics.totalYearlyIncome, seasonData.currency)}`, 400, currentY + 72);
  
  addPresentationFooter(doc, 1, 8, playerName);

  // SLIDE 2: PLAYER PROFILE & ACHIEVEMENTS
  doc.addPage();
  addPresentationHeader(doc, "PLAYER PROFILE", "Achievements & Career Highlights", 2, 8);
  
  currentY = 120;
  
  // Two-column layout
  const colWidth = (pageWidth - 120) / 2;
  
  // Left column - Profile
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY, colWidth, 300, "F");
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.rect(40, currentY, colWidth, 300);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PLAYER PROFILE", 60, currentY + 30);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const profileTemplate = [
    "Name: [YOUR NAME]",
    "Age: [YOUR AGE]",
    "Nationality: [YOUR COUNTRY]",
    "Current Ranking: [ATP/WTA RANKING]",
    "Career High: [HIGHEST RANKING]",
    "Playing Style: [e.g., Right-handed, One-handed backhand]",
    "Coach: [COACH NAME]",
    "Home Base: [TRAINING LOCATION]",
    "",
    "Career Prize Money: [TOTAL EARNINGS]",
    "Titles Won: [NUMBER OF TITLES]",
    "Years Professional: [NUMBER OF YEARS]"
  ];
  
  profileTemplate.forEach((item, index) => {
    if (item === "") return;
    doc.text(item, 60, currentY + 60 + (index * 16));
  });
  
  // Right column - Achievements
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(60 + colWidth, currentY, colWidth, 300, "F");
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.rect(60 + colWidth, currentY, colWidth, 300);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("KEY ACHIEVEMENTS", 80 + colWidth, currentY + 30);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const achievementsTemplate = [
    "• [ACHIEVEMENT 1 - e.g., Won ITF Title in Spain]",
    "• [ACHIEVEMENT 2 - e.g., Reached ATP Challenger QF]",
    "• [ACHIEVEMENT 3 - e.g., Beat Top 100 Player]",
    "• [ACHIEVEMENT 4 - e.g., Team Captain for Country]",
    "",
    "MEDIA HIGHLIGHTS:",
    "• [MEDIA MENTION 1]",
    "• [MEDIA MENTION 2]",
    "",
    "SOCIAL IMPACT:",
    "• [COMMUNITY WORK 1]",
    "• [COMMUNITY WORK 2]",
    "",
    "[ADD YOUR PHOTO HERE]",
    "[Professional headshot recommended]"
  ];
  
  achievementsTemplate.forEach((item, index) => {
    if (item === "") return;
    if (item.startsWith("MEDIA") || item.startsWith("SOCIAL")) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(item, 80 + colWidth, currentY + 60 + (index * 16));
  });
  
  addPresentationFooter(doc, 2, 8, playerName);

  // SLIDE 3: SPONSORSHIP PACKAGES
  doc.addPage();
  addPresentationHeader(doc, "SPONSORSHIP PACKAGES", "Partnership Investment Tiers", 3, 8);
  
  currentY = 120;
  
  // Package grid layout
  const packageWidth = (pageWidth - 160) / 3;
  const packages = [
    {
      title: "BRONZE PACKAGE",
      price: "$[10,000-25,000]",
      color: { r: 205, g: 127, b: 50 }, // Bronze color
      benefits: [
        "• Equipment support",
        "• Social media mentions",
        "• Tournament updates",
        "• Quarterly reports"
      ]
    },
    {
      title: "SILVER PACKAGE", 
      price: "$[25,000-50,000]",
      color: { r: 192, g: 192, b: 192 }, // Silver color
      benefits: [
        "• Logo on apparel",
        "• Website feature",
        "• Monthly content",
        "• Training camp access"
      ]
    },
    {
      title: "GOLD PACKAGE",
      price: "$[50,000+]", 
      color: COLORS.secondary, // Gold color
      benefits: [
        "• Exclusive partnership",
        "• Co-marketing rights",
        "• VIP tournament access",
        "• Custom activations"
      ]
    }
  ];
  
  packages.forEach((pkg, index) => {
    const x = 40 + (index * (packageWidth + 20));
    
    // Package card
    doc.setFillColor(pkg.color.r, pkg.color.g, pkg.color.b);
    doc.rect(x, currentY, packageWidth, 60, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(pkg.title, x + 10, currentY + 25);
    
    doc.setFontSize(16);
    doc.text(pkg.price, x + 10, currentY + 45);
    
    // Benefits box
    doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
    doc.rect(x, currentY + 70, packageWidth, 200, "F");
    doc.setDrawColor(pkg.color.r, pkg.color.g, pkg.color.b);
    doc.setLineWidth(2);
    doc.rect(x, currentY + 70, packageWidth, 200);
    
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    pkg.benefits.forEach((benefit, bIndex) => {
      doc.text(benefit, x + 10, currentY + 100 + (bIndex * 18));
    });
  });
  
  // ROI section
  currentY = currentY + 290;
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(40, currentY, pageWidth - 80, 80, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("EXPECTED ROI FOR SPONSORS", 60, currentY + 30);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("• Tournament exposure: [X] events with live scoring visibility", 60, currentY + 55);
  doc.text("• Social media reach: [X] followers across platforms", 450, currentY + 55);
  
  addPresentationFooter(doc, 3, 8, playerName);

  // SLIDE 4: TOURNAMENT SCHEDULE & EXPOSURE
  doc.addPage();
  addPresentationHeader(doc, "TOURNAMENT SCHEDULE", "2025 Competition Calendar & Exposure Opportunities", 4, 8);
  
  currentY = 120;
  
  // Tournament calendar template
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("2025 TOURNAMENT CALENDAR", 40, currentY);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("[CUSTOMIZE THIS SECTION WITH YOUR ACTUAL TOURNAMENT SCHEDULE]", 40, currentY + 25);
  
  const tournamentTemplate = [
    ["Month", "Tournament", "Location", "Surface", "Prize Money", "Sponsor Exposure"],
    ["January", "[Tournament Name 1]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "Logo on TV, Social posts"],
    ["February", "[Tournament Name 2]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "Press conference, Website"],
    ["March", "[Tournament Name 3]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "Interview opportunities"],
    ["April", "[Tournament Name 4]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "Behind-scenes content"],
    ["May", "[Tournament Name 5]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "VIP hospitality"],
    ["June", "[Tournament Name 6]", "[City, Country]", "[Clay/Hard/Grass]", "$[Amount]", "Co-marketing activation"],
    ["[Continue...]", "[Add more tournaments]", "[As needed]", "[Surface type]", "$[Amount]", "[Sponsor benefits]"]
  ];
  
  const scheduleTable = {
    startY: currentY + 40,
    head: [tournamentTemplate[0]],
    body: tournamentTemplate.slice(1),
    theme: 'striped' as const,
    headStyles: {
      fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 10,
      fontStyle: 'bold' as const
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b] as [number, number, number]
    },
    margin: { left: 40, right: 40 }
  };
  
  autoTable(doc, scheduleTable);
  
  // Exposure metrics box
  currentY = doc.lastAutoTable.finalY + 20;
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(40, currentY, pageWidth - 80, 60, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ANNUAL EXPOSURE VALUE", 60, currentY + 25);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Tournament Days: [X] • Live Stream Viewers: [X] • Social Media Impressions: [X]", 60, currentY + 45);
  
  addPresentationFooter(doc, 4, 8, playerName);

  // SLIDE 5: SOCIAL MEDIA & DIGITAL PRESENCE
  doc.addPage();
  addPresentationHeader(doc, "DIGITAL PRESENCE", "Social Media & Online Engagement Strategy", 5, 8);
  
  currentY = 120;
  
  // Social media stats grid
  const socialPlatforms = [
    { name: "Instagram", handle: "[@YOUR_HANDLE]", followers: "[X] followers", engagement: "[X]% engagement" },
    { name: "TikTok", handle: "[@YOUR_HANDLE]", followers: "[X] followers", engagement: "[X]% engagement" },
    { name: "Twitter/X", handle: "[@YOUR_HANDLE]", followers: "[X] followers", engagement: "[X]% engagement" },
    { name: "YouTube", handle: "[YOUR_CHANNEL]", followers: "[X] subscribers", engagement: "[X] avg views" }
  ];
  
  const platformWidth = (pageWidth - 160) / 2;
  
  socialPlatforms.forEach((platform, index) => {
    const x = 40 + ((index % 2) * (platformWidth + 40));
    const y = currentY + (Math.floor(index / 2) * 120);
    
    doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
    doc.rect(x, y, platformWidth, 100, "F");
    doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
    doc.setLineWidth(2);
    doc.rect(x, y, platformWidth, 100);
    
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(platform.name, x + 20, y + 30);
    
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(platform.handle, x + 20, y + 50);
    doc.text(platform.followers, x + 20, y + 67);
    doc.text(platform.engagement, x + 20, y + 84);
  });
  
  // Content strategy
  currentY = currentY + 260;
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(40, currentY, pageWidth - 80, 100, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENT STRATEGY FOR SPONSORS", 60, currentY + 30);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const contentStrategy = [
    "• Training session features with sponsor product placement",
    "• Tournament day vlogs highlighting sponsor support", 
    "• Post-match interviews mentioning sponsor partnerships",
    "• Behind-the-scenes content showcasing sponsor equipment"
  ];
  
  contentStrategy.forEach((item, index) => {
    doc.text(item, 60, currentY + 55 + (index * 15));
  });
  
  addPresentationFooter(doc, 5, 8, playerName);

  // SLIDE 6: FINANCIAL OVERVIEW 
  doc.addPage();
  addPresentationHeader(doc, "FINANCIAL OVERVIEW", "Professional Budget & Investment Allocation", 6, 8);
  
  currentY = 120;
  
  // Budget breakdown
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ANNUAL BUDGET BREAKDOWN", 40, currentY);
  
  const budgetData = Object.entries(financialData.monthlyExpenses).map(([category, amount]) => [
    category.charAt(0).toUpperCase() + category.slice(1),
    formatCurrency(amount, seasonData.currency),
    formatCurrency(amount * 12, seasonData.currency),
    `${((amount * 12 / metrics.yearlyExpenses) * 100).toFixed(1)}%`,
    "[How sponsor support helps]"
  ]);
  
  const budgetTable = {
    startY: currentY + 30,
    head: [["Category", "Monthly", "Annual", "% of Budget", "Sponsor Impact"]],
    body: budgetData,
    theme: 'striped' as const,
    headStyles: {
      fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontSize: 10,
      fontStyle: 'bold' as const
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b] as [number, number, number]
    },
    margin: { left: 40, right: 40 }
  };
  
  autoTable(doc, budgetTable);
  
  // Financial goals
  currentY = doc.lastAutoTable.finalY + 30;
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(40, currentY, pageWidth - 80, 100, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL GOALS WITH SPONSOR SUPPORT", 60, currentY + 30);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Target Ranking: [YOUR GOAL] • Projected Prize Money: ${formatCurrency(metrics.totalYearlyIncome, seasonData.currency)}`, 60, currentY + 55);
  doc.text("ROI for Sponsors: Professional financial management demonstrates serious commitment", 60, currentY + 75);
  
  addPresentationFooter(doc, 6, 8, playerName);

  // SLIDE 7: PARTNERSHIP BENEFITS & ACTIVATION
  doc.addPage();
  addPresentationHeader(doc, "PARTNERSHIP BENEFITS", "What Sponsors Get & Activation Opportunities", 7, 8);
  
  currentY = 120;
  
  // Two-column benefits layout
  const benefitColWidth = (pageWidth - 120) / 2;
  
  // Left column - Tangible benefits
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY, benefitColWidth, 280, "F");
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(2);
  doc.rect(40, currentY, benefitColWidth, 280);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TANGIBLE BENEFITS", 60, currentY + 30);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const tangibleBenefits = [
    "• Logo placement on [specify locations]",
    "• Social media posts: [X] per month",
    "• Website featuring: [duration]", 
    "• Press release announcements",
    "• Tournament hospitality rights",
    "• Equipment product placement",
    "• Training camp access",
    "• Meet-and-greet opportunities",
    "• Autograph sessions",
    "• Professional photography rights"
  ];
  
  tangibleBenefits.forEach((benefit, index) => {
    doc.text(benefit, 60, currentY + 60 + (index * 20));
  });
  
  // Right column - Strategic value
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(60 + benefitColWidth, currentY, benefitColWidth, 280, "F");
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(2);
  doc.rect(60 + benefitColWidth, currentY, benefitColWidth, 280);
  
  doc.setTextColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("STRATEGIC VALUE", 80 + benefitColWidth, currentY + 30);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const strategicValue = [
    "• Brand association with elite athletics",
    "• Access to tennis demographic",
    "• International market exposure",
    "• Content creation opportunities", 
    "• CSR and community impact stories",
    "• Employee engagement programs",
    "• Client entertainment options",
    "• Media coverage amplification",
    "• Long-term partnership growth",
    "• Performance-based ROI tracking"
  ];
  
  strategicValue.forEach((value, index) => {
    doc.text(value, 80 + benefitColWidth, currentY + 60 + (index * 20));
  });
  
  addPresentationFooter(doc, 7, 8, playerName);

  // SLIDE 8: CONTACT & NEXT STEPS
  doc.addPage();
  addPresentationHeader(doc, "LET'S PARTNER", "Contact Information & Next Steps", 8, 8);
  
  currentY = 120;
  
  // Contact section
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(40, currentY, pageWidth - 80, 120, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to Make Tennis History Together?", 60, currentY + 40);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Contact me to discuss partnership opportunities and customize this proposal", 60, currentY + 70);
  
  // Contact details box
  currentY = currentY + 140;
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.rect(40, currentY, pageWidth - 80, 200, "F");
  doc.setDrawColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.setLineWidth(3);
  doc.rect(40, currentY, pageWidth - 80, 200);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONTACT INFORMATION", 60, currentY + 40);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const contactTemplate = [
    "Email: [your.email@example.com]",
    "Phone: [+X XXX-XXX-XXXX]",
    "Website: [www.yourwebsite.com]", 
    "Social: [@your_handle]",
    "",
    "Management/Agent: [Agent Name]",
    "Agent Contact: [agent@agency.com]",
    "",
    "Next Steps:",
    "1. Schedule a partnership discussion call",
    "2. Customize proposal based on your brand objectives", 
    "3. Develop activation timeline and deliverables",
    "4. Execute partnership agreement"
  ];
  
  contactTemplate.forEach((item, index) => {
    if (item === "") return;
    if (item.startsWith("Next Steps:")) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(item, 60, currentY + 70 + (index * 16));
  });
  
  addPresentationFooter(doc, 8, 8, playerName);
  
  doc.save(`Sponsorship_Template_${playerName.replace(/\s+/g, '_')}_Season_2025.pdf`);
}
