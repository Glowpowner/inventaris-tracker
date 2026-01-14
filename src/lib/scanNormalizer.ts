// URL prefix to strip from scanned values
const URL_PREFIX = "https://eqin.centix.com/object/249bq-g0X/";

export interface NormalizationResult {
  raw: string;
  normalized: string;
}

/**
 * Normalizes a scanned value according to the specification:
 * 1. Strip URL prefix if present
 * 2. Trim whitespace
 * 3. Keep only A-Z and 0-9, convert to uppercase
 */
export function normalizeScan(input: string): NormalizationResult {
  const raw = input;
  
  // Step 1: Strip URL prefix if present
  let value = input;
  if (value.startsWith(URL_PREFIX)) {
    value = value.substring(URL_PREFIX.length);
  }
  
  // Step 2: Trim whitespace
  value = value.trim();
  
  // Step 3: Keep only alphanumeric, uppercase
  value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  return { raw, normalized: value };
}

/**
 * Attempts to find a matching equipment number from the list.
 * Matching strategy:
 * a) Exact match (case-insensitive) with Equipment# values
 * b) If no match and value is 7 digits, try with "IDT" prefix
 * c) If no match and value starts with "IDT" + 7 digits, try without "IDT"
 */
export function findMatch(
  normalizedValue: string,
  equipmentNumbers: string[]
): string | null {
  // Normalize all equipment numbers for comparison
  const normalizedEquipment = equipmentNumbers.map(eq => ({
    original: eq,
    normalized: eq.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  }));
  
  // Step a: Exact match
  const exactMatch = normalizedEquipment.find(
    eq => eq.normalized === normalizedValue
  );
  if (exactMatch) {
    return exactMatch.original;
  }
  
  // Step b: If value is purely 7 digits, try with IDT prefix
  if (/^\d{7}$/.test(normalizedValue)) {
    const withPrefix = `IDT${normalizedValue}`;
    const prefixMatch = normalizedEquipment.find(
      eq => eq.normalized === withPrefix
    );
    if (prefixMatch) {
      return prefixMatch.original;
    }
  }
  
  // Step c: If value starts with IDT + 7 digits, try without IDT
  const idtMatch = normalizedValue.match(/^IDT(\d{7})$/);
  if (idtMatch) {
    const withoutPrefix = idtMatch[1];
    const noPrefixMatch = normalizedEquipment.find(
      eq => eq.normalized === withoutPrefix
    );
    if (noPrefixMatch) {
      return noPrefixMatch.original;
    }
  }
  
  return null;
}
