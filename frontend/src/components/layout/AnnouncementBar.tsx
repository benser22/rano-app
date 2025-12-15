"use client";

import { useState, useEffect, useMemo } from 'react';
import { Truck, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useStoreConfig } from '@/lib/useStoreConfig';

type AnnouncementItem = {
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  text: string;
};

export default function AnnouncementBar() {
  const { config } = useStoreConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Build announcements dynamically from config
  const announcements: AnnouncementItem[] = useMemo(() => [
    {
      icon: Truck,
      text: `Envío gratis en compras mayores a $${config.freeShippingMin.toLocaleString('es-AR')}`,
    },
    {
      image: '/mp_logo.png',
      text: 'Comprá fácil con Mercado Pago',
    },
    {
      icon: MapPin,
      text: config.address || 'Av. Belgrano 3659, San Miguel de Tucumán',
    },
  ], [config.freeShippingMin, config.address]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsExiting(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const current = announcements[currentIndex];
  const CurrentIcon = current.icon;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 overflow-hidden">
      <div className="container mx-auto flex items-center justify-center">
        <div
          className={`flex items-center gap-2 text-sm font-medium transition-all duration-500 ease-in-out ${isExiting
            ? 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
            }`}
          style={{
            animation: isExiting ? 'none' : 'slideIn 0.5s ease-out'
          }}
        >
          {CurrentIcon && <CurrentIcon className="h-4 w-4 shrink-0" />}
          {current.image && (
            <Image
              src={current.image}
              alt=""
              width={20}
              height={20}
              className="h-5 w-auto shrink-0"
            />
          )}
          <span>{current.text}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
