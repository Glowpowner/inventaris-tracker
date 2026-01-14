import { useState, useCallback } from 'react';
import { Package, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/FileUpload';
import { ScanInput } from '@/components/ScanInput';
import { StatsCard } from '@/components/StatsCard';
import { InventoryTable } from '@/components/InventoryTable';
import { UnknownScansPanel } from '@/components/UnknownScansPanel';
import { ColumnSelector } from '@/components/ColumnSelector';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { parseExcelFile, exportToExcel } from '@/lib/excelParser';
import { normalizeScan, findMatch } from '@/lib/scanNormalizer';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [pendingData, setPendingData] = useState<{
    headers: string[];
    rows: Record<string, string>[];
    quantityColumnName: string | null;
  } | null>(null);

  const {
    items,
    headers,
    equipmentColumnName,
    quantityColumnName,
    unknownScans,
    setInventoryData,
    incrementCount,
    addUnknownScan,
    resetCounts,
    clearAll,
    getEquipmentNumbers,
    getStats
  } = useInventoryStore();

  const stats = getStats();

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      
      if (data.equipmentColumnIndex === -1) {
        // Need to select column
        setPendingData({
          headers: data.headers,
          rows: data.rows,
          quantityColumnName: data.quantityColumnName
        });
        setShowColumnSelector(true);
      } else {
        // Auto-detected
        const inventoryItems = data.rows.map(row => ({
          equipmentNumber: row[data.equipmentColumnName].toUpperCase(),
          data: row,
          counted: 0
        }));
        
        setInventoryData(
          inventoryItems,
          data.headers,
          data.equipmentColumnName,
          data.quantityColumnName
        );
        
        toast({
          title: 'Bestand geladen',
          description: `${inventoryItems.length} items geïmporteerd. Kolom "${data.equipmentColumnName}" gedetecteerd.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: error instanceof Error ? error.message : 'Onbekende fout',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [setInventoryData, toast]);

  const handleColumnSelect = useCallback((columnName: string) => {
    if (!pendingData) return;
    
    const inventoryItems = pendingData.rows
      .filter(row => row[columnName])
      .map(row => ({
        equipmentNumber: row[columnName].toUpperCase(),
        data: row,
        counted: 0
      }));
    
    setInventoryData(
      inventoryItems,
      pendingData.headers,
      columnName,
      pendingData.quantityColumnName
    );
    
    setShowColumnSelector(false);
    setPendingData(null);
    
    toast({
      title: 'Bestand geladen',
      description: `${inventoryItems.length} items geïmporteerd met kolom "${columnName}".`,
    });
  }, [pendingData, setInventoryData, toast]);

  const handleScan = useCallback((rawInput: string) => {
    const { raw, normalized } = normalizeScan(rawInput);
    const equipmentNumbers = getEquipmentNumbers();
    
    const matchedEquipment = findMatch(normalized, equipmentNumbers);
    
    if (matchedEquipment) {
      const newCount = incrementCount(matchedEquipment);
      toast({
        title: `✓ Gevonden: ${matchedEquipment}`,
        description: `Geteld: ${newCount}`,
      });
    } else {
      addUnknownScan(raw, normalized);
      toast({
        title: '⚠ Onbekend nummer',
        description: normalized,
        variant: 'destructive'
      });
    }
  }, [getEquipmentNumbers, incrementCount, addUnknownScan, toast]);

  const handleExport = useCallback(() => {
    const exportData = items.map(item => {
      const row: Record<string, unknown> = { ...item.data };
      row['Geteld'] = item.counted;
      
      if (quantityColumnName) {
        const expected = parseInt(item.data[quantityColumnName]) || 0;
        row['Verschil'] = item.counted - expected;
      }
      
      return row;
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    exportToExcel(exportData, unknownScans, `voorraadtelling-${timestamp}.xlsx`);
    
    toast({
      title: 'Export voltooid',
      description: 'Het Excel bestand is gedownload.',
    });
  }, [items, quantityColumnName, unknownScans, toast]);

  const handleReset = useCallback(() => {
    if (confirm('Weet je zeker dat je alle tellingen wilt resetten?')) {
      resetCounts();
      toast({
        title: 'Tellingen gereset',
        description: 'Alle tellingen en onbekende scans zijn gewist.',
      });
    }
  }, [resetCounts, toast]);

  const handleClear = useCallback(() => {
    if (confirm('Weet je zeker dat je alle data wilt wissen? Dit verwijdert ook de geüploade Excel data.')) {
      clearAll();
      toast({
        title: 'Data gewist',
        description: 'Alle data is verwijderd.',
      });
    }
  }, [clearAll, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Voorraad Telling</h1>
                <p className="text-sm text-muted-foreground">Scan en tel equipment items</p>
              </div>
            </div>
            
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Wissen
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporteren
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* File Upload or Scan Input */}
        {items.length === 0 ? (
          <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
        ) : (
          <>
            {/* Scan Input */}
            <ScanInput onScan={handleScan} disabled={items.length === 0} />

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard 
                title="Totaal items" 
                value={stats.totalItems} 
                icon={FileSpreadsheet}
              />
              <StatsCard 
                title="Totaal gescand" 
                value={stats.totalScanned} 
                icon={Package}
                variant="success"
              />
              <StatsCard 
                title="Unieke items" 
                value={stats.uniqueScanned} 
                icon={CheckCircle2}
                variant="success"
              />
              <StatsCard 
                title="Onbekende scans" 
                value={stats.unknownCount} 
                icon={AlertTriangle}
                variant={stats.unknownCount > 0 ? 'error' : 'default'}
              />
            </div>

            {/* Unknown Scans Panel */}
            <UnknownScansPanel scans={unknownScans} />

            {/* Inventory Table */}
            <InventoryTable
              items={items}
              headers={headers}
              equipmentColumnName={equipmentColumnName}
              quantityColumnName={quantityColumnName}
            />

            {/* Upload new file button */}
            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Nieuw bestand uploaden
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* Column Selector Dialog */}
      <ColumnSelector
        isOpen={showColumnSelector}
        headers={pendingData?.headers || []}
        onSelect={handleColumnSelect}
        onClose={() => setShowColumnSelector(false)}
      />
    </div>
  );
};

export default Index;
