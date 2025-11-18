import Papa from 'papaparse';

// Simple in-memory cache with expiration
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_DURATION_MS = 60000; // 1 minute cache

/**
 * Generic CSV fetcher using PapaParse with in-memory caching
 * @param url - The URL of the CSV file to fetch
 * @param useHeaders - Whether the CSV has headers (default: true). If false, columns are accessed by index
 * @returns Promise resolving to array of parsed CSV rows
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchCSV<T = any>(url: string, useHeaders: boolean = true): Promise<T[]> {
  try {
    // Check cache first
    const cacheKey = `${url}-${useHeaders}`;
    const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`Using cached data for ${url}`);
      return cached.data;
    }

    // Fetch fresh data
    console.log(`Fetching fresh data for ${url}`);
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();

    const data = await new Promise<T[]>((resolve, reject) => {
      Papa.parse(csvText, {
        header: useHeaders,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });

    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error('Error fetching CSV:', error);
    throw error;
  }
}

/**
 * Clean and normalize strings for comparison
 * @param str - String to normalize
 * @returns Trimmed lowercase string
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.trim().toLowerCase();
}

/**
 * Parse numeric values from various formats
 * Handles currency symbols (£, $) and comma separators
 * @param value - Value to parse (string or number)
 * @returns Parsed number, or 0 if parsing fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
