// OCR Route for Receipt Processing
// This is a client-side mock implementation for demonstration
// In a real app, this would be a server-side API route

export async function processReceipt(file: File): Promise<{
  amount?: number;
  description?: string;
  category?: string;
  currency?: string;
  occurred_at?: string;
}> {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock OCR results - in reality this would use Tesseract.js or cloud OCR
  const mockResults = [
    {
      amount: 45.67,
      description: "Hotel Accommodation",
      category: "lodging",
      currency: "USD",
      occurred_at: new Date().toISOString().split('T')[0]
    },
    {
      amount: 23.50,
      description: "Restaurant Meal",
      category: "meals",
      currency: "USD",
      occurred_at: new Date().toISOString().split('T')[0]
    },
    {
      amount: 85.00,
      description: "Taxi Service",
      category: "ground",
      currency: "USD",
      occurred_at: new Date().toISOString().split('T')[0]
    },
    {
      amount: 180.00,
      description: "Tournament Entry Fee",
      category: "entries",
      currency: "USD",
      occurred_at: new Date().toISOString().split('T')[0]
    }
  ];

  // Return random result for demo
  const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  
  return randomResult;
}

// For Vite development, we'll create a mock fetch interceptor
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.includes('/api/ocr')) {
      // Mock OCR API response
      const formData = init?.body as FormData;
      const file = formData?.get('receipt') as File;
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const result = await processReceipt(file);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'OCR processing failed' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For all other requests, use original fetch
    return originalFetch(input, init);
  };
}

export default processReceipt;
