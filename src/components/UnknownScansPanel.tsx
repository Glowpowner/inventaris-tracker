import { AlertCircle, X } from 'lucide-react';
import type { UnknownScan } from '@/hooks/useInventoryStore';

interface UnknownScansPanelProps {
  scans: UnknownScan[];
}

export function UnknownScansPanel({ scans }: UnknownScansPanelProps) {
  if (scans.length === 0) return null;

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <h3 className="font-semibold text-foreground">
          Onbekende scans ({scans.length})
        </h3>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {scans.map((scan, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between bg-card rounded-lg px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium text-foreground">{scan.normalized}</span>
              {scan.raw !== scan.normalized && (
                <span className="text-muted-foreground ml-2 text-xs">
                  (origineel: {scan.raw.substring(0, 30)}{scan.raw.length > 30 ? '...' : ''})
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(scan.timestamp).toLocaleTimeString('nl-NL')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
