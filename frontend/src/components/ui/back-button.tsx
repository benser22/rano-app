"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface BackButtonProps {
  label?: string;
  className?: string;
  fallbackRoute?: string;
}

export function BackButton({
  label = "Volver",
  className,
  fallbackRoute = "/"
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
