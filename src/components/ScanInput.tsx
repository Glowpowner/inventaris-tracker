import { useState, useRef, useEffect, useCallback } from 'react';
import { Scan } from 'lucide-react';

interface ScanInputProps {
  onScan: (value: string) => void;
  disabled?: boolean;
}

export function ScanInput({ onScan, disabled }: ScanInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and after each scan
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onScan(value);
      setValue('');
      // Re-focus after processing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [value, onScan]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return (
    <div className="scan-input-container">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scan className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Scan invoer
          </label>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Upload eerst een Excel bestand...' : 'Scan barcode of voer nummer in...'}
            className="w-full bg-transparent border-none outline-none text-lg font-medium text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
        </div>
        
        <div className="flex-shrink-0 text-xs text-muted-foreground">
          Druk op Enter ↵
        </div>
      </div>
    </div>
  );
}
