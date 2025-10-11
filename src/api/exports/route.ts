// Export API Routes for Season Data
// Handles CSV exports and ZIP archives for receipts

import { supabase } from "@/integrations/supabase/client";

/**
 * Generate CSV content from season line items
 */
function generateSeasonCSV(lineItems: any[], seasonTitle: string): string {
  const headers = [
    'Date',
    'Description', 
    'Category',
    'Type',
    'Amount',
    'Currency',
    'Scenario',
    'Tournament',
    'Location',
    'Notes'
  ].join(',');

  const rows = lineItems.map(item => [
    item.created_at || '',
    `"${(item.label || '').replace(/"/g, '""')}"`, // Escape quotes
    item.category || '',
    item.type || 'expense',
    item.unit_cost || 0,
    item.currency || 'USD',
    item.scenario_name || '',
    item.tournament || '',
    item.location || '',
    `"${(item.notes || '').replace(/"/g, '""')}"` // Escape quotes
  ].join(','));

  const csvContent = [
    `# ${seasonTitle} - Season Export`,
    `# Generated: ${new Date().toISOString()}`,
    headers,
    ...rows
  ].join('\n');

  return csvContent;
}

/**
 * Mock CSV export endpoint
 * In a real application, this would be a server-side route
 */
export async function exportSeasonCSV(seasonId: string): Promise<Blob> {
  try {
    // Fetch season data from Supabase
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .select('title, season_year')
      .eq('id', seasonId)
      .single();

    if (budgetError) throw budgetError;

    // Fetch line items with scenario information
    const { data: lineItems, error: itemsError } = await supabase
      .from('line_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemsError) throw itemsError;

    // Transform data for CSV
    const transformedItems = (lineItems || []).map(item => ({
      ...item,
      scenario_name: '', // Scenario name not available in this query
      category: item.category_id || 'misc',
      type: 'expense' // Default type - adjust based on your schema
    }));

    const seasonTitle = `${budgetData.title} (${budgetData.season_year})`;
    const csvContent = generateSeasonCSV(transformedItems, seasonTitle);

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to generate CSV export');
  }
}

/**
 * Mock ZIP export for receipts (Pro feature)
 */
export async function exportReceiptsZIP(seasonId: string, isProUser: boolean): Promise<Blob> {
  if (!isProUser) {
    throw new Error('Receipt exports are available with Pro membership');
  }

  try {
    // In a real implementation, this would:
    // 1. Query receipt files from storage
    // 2. Stream files into a ZIP archive
    // 3. Return the ZIP blob

    // Mock implementation
    const mockFiles = [
      { name: 'receipt-001-hotel.jpg', content: 'Mock receipt data 1' },
      { name: 'receipt-002-flight.pdf', content: 'Mock receipt data 2' },
      { name: 'receipt-003-meals.jpg', content: 'Mock receipt data 3' }
    ];

    // For demo purposes, create a simple text file
    const receiptList = mockFiles
      .map(file => `${file.name} - ${file.content}`)
      .join('\n');

    const zipContent = `Season ${seasonId} Receipts\n\nFiles:\n${receiptList}`;

    return new Blob([zipContent], { type: 'application/zip' });

  } catch (error) {
    console.error('ZIP export error:', error);
    throw new Error('Failed to generate receipt archive');
  }
}

/**
 * Download helper function
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export handlers for UI components
 */
export const exportHandlers = {
  
  async downloadSeasonCSV(seasonId: string, seasonTitle: string) {
    try {
      const csvBlob = await exportSeasonCSV(seasonId);
      const filename = `${seasonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
      downloadBlob(csvBlob, filename);
      return { success: true };
    } catch (error) {
      console.error('CSV download failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  },

  async downloadReceiptsZIP(seasonId: string, seasonTitle: string, isProUser: boolean) {
    try {
      const zipBlob = await exportReceiptsZIP(seasonId, isProUser);
      const filename = `${seasonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_receipts.zip`;
      downloadBlob(zipBlob, filename);
      return { success: true };
    } catch (error) {
      console.error('ZIP download failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }
};

// Mock server endpoints for Vite development
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Handle CSV export endpoint
    if (url.includes('/api/exports/season.csv')) {
      const urlObj = new URL(url, window.location.origin);
      const seasonId = urlObj.searchParams.get('seasonId');
      
      if (!seasonId) {
        return new Response(JSON.stringify({ error: 'Season ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const csvBlob = await exportSeasonCSV(seasonId);
        return new Response(csvBlob, {
          status: 200,
          headers: { 
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="season_${seasonId}.csv"`
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'CSV generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle ZIP export endpoint
    if (url.includes('/api/exports/receipts.zip')) {
      const urlObj = new URL(url, window.location.origin);
      const seasonId = urlObj.searchParams.get('seasonId');
      
      if (!seasonId) {
        return new Response(JSON.stringify({ error: 'Season ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        // Mock Pro check - in real app this would verify via auth
        const isProUser = true; // Replace with real Pro status check
        const zipBlob = await exportReceiptsZIP(seasonId, isProUser);
        
        return new Response(zipBlob, {
          status: 200,
          headers: { 
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="receipts_${seasonId}.zip"`
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'ZIP generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For all other requests, use original fetch
    return originalFetch(input, init);
  };
}
