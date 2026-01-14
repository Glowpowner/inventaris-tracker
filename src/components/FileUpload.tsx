import { useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-card"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            Excel bestand uploaden
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Sleep een .xlsx bestand hierheen of klik om te selecteren
          </p>
        </div>
        
        <Button variant="outline" disabled={isLoading}>
          <Upload className="w-4 h-4 mr-2" />
          {isLoading ? 'Bezig met laden...' : 'Bestand kiezen'}
        </Button>
      </div>
    </div>
  );
}
