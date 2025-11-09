/**
 * ResumeNameModal Component
 * Modal component for naming/renaming resumes using Sheet from component library
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@subbiah/reusable/components/ui/sheet';
import { Input } from '@subbiah/reusable/components/ui/input';
import { Label } from '@subbiah/reusable/components/ui/label';
import { Button } from '@subbiah/reusable/components/ui/button';

interface ResumeNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
}

export function ResumeNameModal({
  open,
  onOpenChange,
  onSave,
  initialName = '',
  title = 'Save Resume',
}: ResumeNameModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  // Reset state when modal opens/closes or initialName changes
  useEffect(() => {
    if (open) {
      setName(initialName);
      setError('');
    }
  }, [open, initialName]);

  const handleSave = () => {
    // Validate name
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Resume name is required');
      return;
    }

    if (trimmedName.length < 1) {
      setError('Resume name must be at least 1 character');
      return;
    }

    // Call onSave with validated name
    onSave(trimmedName);

    // Close modal
    onOpenChange(false);

    // Reset state
    setName('');
    setError('');
  };

  const handleCancel = () => {
    // Close modal without saving
    onOpenChange(false);

    // Reset state
    setName('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card">
        <SheetHeader>
          <SheetTitle className="text-foreground">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Enter a name for your resume to save it.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume-name" className="text-foreground">
              Resume Name
            </Label>
            <Input
              id="resume-name"
              type="text"
              placeholder="e.g., Software Engineer Resume"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error on change
              }}
              onKeyDown={handleKeyDown}
              className={error ? 'border-destructive' : ''}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
