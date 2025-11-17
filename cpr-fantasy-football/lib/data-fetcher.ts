import Papa from 'papaparse';

// Generic CSV fetcher with caching
export async function fetchCSV<T = any>(url: string): Promise<T[]> {
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error fetching CSV:', error);
    throw error;
  }
}

// Helper to clean and normalize strings
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.trim().toLowerCase();
}

// Helper to parse numeric values
export function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[£$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
