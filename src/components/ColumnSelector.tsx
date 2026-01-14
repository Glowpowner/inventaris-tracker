import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ColumnSelectorProps {
  isOpen: boolean;
  headers: string[];
  onSelect: (columnName: string) => void;
  onClose: () => void;
}

export function ColumnSelector({ isOpen, headers, onSelect, onClose }: ColumnSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecteer Equipment kolom</DialogTitle>
          <DialogDescription>
            De kolom "Equipment#" is niet gevonden. Selecteer de kolom die de equipment nummers bevat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-2 mt-4">
          {headers.filter(h => h).map(header => (
            <Button
              key={header}
              variant="outline"
              className="justify-start text-left"
              onClick={() => onSelect(header)}
            >
              {header}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
