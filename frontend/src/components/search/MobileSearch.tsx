"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchCombobox } from './SearchCombobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MobileSearch() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buscar productos">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md top-[10%] translate-y-0">
        <DialogHeader>
          <DialogTitle>Buscar productos</DialogTitle>
        </DialogHeader>
        <SearchCombobox
          className="w-full"
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
