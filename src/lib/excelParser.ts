import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  headers: string[];
  rows: Record<string, string>[];
  equipmentColumnIndex: number;
  equipmentColumnName: string;
  quantityColumnName: string | null;
}

const EQUIPMENT_COLUMN_NAMES = ['Equipment#', 'Equipment', 'EquipmentNumber', 'Equipment Number', 'Equipmentnr'];
const QUANTITY_COLUMN_NAMES = ['Voorraad', 'Qty', 'Quantity', 'Aantal', 'Stock', 'Count'];

/**
 * Parse an Excel file and extract relevant data
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        });
        
        if (jsonData.length < 2) {
          throw new Error('Excel bestand bevat te weinig data');
        }
        
        // First row is headers
        const headers = jsonData[0].map(h => String(h || '').trim());
        
        // Find Equipment# column (case-insensitive)
        let equipmentColumnIndex = -1;
        let equipmentColumnName = '';
        
        for (const colName of EQUIPMENT_COLUMN_NAMES) {
          const idx = headers.findIndex(
            h => h.toLowerCase() === colName.toLowerCase()
          );
          if (idx !== -1) {
            equipmentColumnIndex = idx;
            equipmentColumnName = headers[idx];
            break;
          }
        }
        
        // Find quantity column
        let quantityColumnName: string | null = null;
        for (const colName of QUANTITY_COLUMN_NAMES) {
          const idx = headers.findIndex(
            h => h.toLowerCase() === colName.toLowerCase()
          );
          if (idx !== -1) {
            quantityColumnName = headers[idx];
            break;
          }
        }
        
        // Convert data rows to objects
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.every(cell => !cell)) continue; // Skip empty rows
          
          const rowObj: Record<string, string> = {};
          headers.forEach((header, idx) => {
            if (header) {
              rowObj[header] = String(row[idx] || '').trim();
            }
          });
          
          // Only add if equipment number exists
          if (equipmentColumnIndex !== -1 && rowObj[equipmentColumnName]) {
            rows.push(rowObj);
          } else if (equipmentColumnIndex === -1 && Object.values(rowObj).some(v => v)) {
            rows.push(rowObj);
          }
        }
        
        resolve({
          headers,
          rows,
          equipmentColumnIndex,
          equipmentColumnName,
          quantityColumnName
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Fout bij het lezen van het bestand'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export data back to Excel
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  unknownScans: { raw: string; normalized: string; timestamp: string }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new();
  
  // Main data sheet
  if (data.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Voorraadtelling');
  }
  
  // Unknown scans sheet
  if (unknownScans.length > 0) {
    const unknownSheet = XLSX.utils.json_to_sheet(
      unknownScans.map(s => ({
        'Ruwe scan': s.raw,
        'Genormaliseerd': s.normalized,
        'Tijdstip': s.timestamp
      }))
    );
    XLSX.utils.book_append_sheet(workbook, unknownSheet, 'Onbekende scans');
  }
  
  XLSX.writeFile(workbook, filename);
}
