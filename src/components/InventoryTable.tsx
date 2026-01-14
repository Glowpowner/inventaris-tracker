import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { InventoryItem } from '@/hooks/useInventoryStore';

interface InventoryTableProps {
  items: InventoryItem[];
  headers: string[];
  equipmentColumnName: string;
  quantityColumnName: string | null;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'equipment' | 'counted' | 'difference' | string;

export function InventoryTable({
  items,
  headers,
  equipmentColumnName,
  quantityColumnName
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('equipment');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter headers to exclude equipment column (we show it first separately)
  const otherHeaders = useMemo(() => {
    return headers.filter(h => h !== equipmentColumnName && h);
  }, [headers, equipmentColumnName]);

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.equipmentNumber.toLowerCase().includes(query) ||
        Object.values(item.data).some(v => v.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'equipment') {
          aVal = a.equipmentNumber;
          bVal = b.equipmentNumber;
        } else if (sortField === 'counted') {
          aVal = a.counted;
          bVal = b.counted;
        } else if (sortField === 'difference' && quantityColumnName) {
          const aQty = parseInt(a.data[quantityColumnName]) || 0;
          const bQty = parseInt(b.data[quantityColumnName]) || 0;
          aVal = a.counted - aQty;
          bVal = b.counted - bQty;
        } else {
          aVal = a.data[sortField] || '';
          bVal = b.data[sortField] || '';
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [items, searchQuery, sortField, sortDirection, quantityColumnName]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortField('equipment');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const getDifferenceDisplay = (item: InventoryItem) => {
    if (!quantityColumnName) return null;
    const expected = parseInt(item.data[quantityColumnName]) || 0;
    const diff = item.counted - expected;
    
    if (diff === 0) return <span className="badge-success">0</span>;
    if (diff > 0) return <span className="badge-warning">+{diff}</span>;
    return <span className="badge-error">{diff}</span>;
  };

  if (items.length === 0) {
    return (
      <div className="table-container p-8 text-center">
        <p className="text-muted-foreground">Geen data geladen. Upload een Excel bestand om te beginnen.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoeken in tabel..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th 
                className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort('equipment')}
              >
                <div className="flex items-center gap-1">
                  Equipment#
                  <SortIcon field="equipment" />
                </div>
              </th>
              
              {otherHeaders.map(header => (
                <th 
                  key={header}
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    <SortIcon field={header} />
                  </div>
                </th>
              ))}
              
              <th 
                className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/80 min-w-[80px]"
                onClick={() => handleSort('counted')}
              >
                <div className="flex items-center justify-center gap-1">
                  Geteld
                  <SortIcon field="counted" />
                </div>
              </th>
              
              {quantityColumnName && (
                <th 
                  className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/80 min-w-[80px]"
                  onClick={() => handleSort('difference')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Verschil
                    <SortIcon field="difference" />
                  </div>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border">
            {filteredAndSorted.map((item, idx) => (
              <tr 
                key={item.equipmentNumber + idx}
                className={`hover:bg-muted/30 transition-colors ${item.counted > 0 ? 'bg-success/5' : ''}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.equipmentNumber}
                </td>
                
                {otherHeaders.map(header => (
                  <td key={header} className="px-4 py-3 text-muted-foreground">
                    {item.data[header] || '-'}
                  </td>
                ))}
                
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                    item.counted > 0 ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.counted}
                  </span>
                </td>
                
                {quantityColumnName && (
                  <td className="px-4 py-3 text-center">
                    {getDifferenceDisplay(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
        {filteredAndSorted.length} van {items.length} items weergegeven
      </div>
    </div>
  );
}
