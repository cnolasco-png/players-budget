/**
 * Professional PDF Template Serving
 * Serves pre-designed Gamma PDFs instead of programmatic generation
 */

export async function generateProfessionalSponsorTemplate(): Promise<Blob> {
  try {
    // Fetch the professionally designed PDF from public folder
    const response = await fetch('/sponsor-tool.pdf');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sponsor template: ${response.status}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error serving sponsor template PDF:', error);
    
    // Fallback: Return empty blob with error handling
    throw new Error('Sponsor template PDF is temporarily unavailable. Please try again later.');
  }
}

export async function generateFinancialMindsetAccelerator(): Promise<Blob> {
  try {
    // Fetch the financial mindset accelerator workbook
    const response = await fetch('/financial-mindset-accelerator.pdf');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial workbook: ${response.status}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error serving financial workbook PDF:', error);
    
    // Fallback: Return empty blob with error handling  
    throw new Error('Financial workbook PDF is temporarily unavailable. Please try again later.');
  }
}

/**
 * Utility function to download any PDF with proper filename
 */
export function downloadPDF(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
}
