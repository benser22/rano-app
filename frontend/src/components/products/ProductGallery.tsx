"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/api/strapi";
import { type Image as ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
}

export function ProductGallery({
  images,
  productName,
  hasDiscount,
  discountPercentage
}: ProductGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Autoplay plugin - pauses on hover
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // If no images, use placeholder
  const displayImages = images.length > 0 ? images : [{ id: 0, url: '', width: 0, height: 0 }];

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          setApi={setApi}
          className="w-full"
          plugins={displayImages.length > 1 ? [autoplayPlugin.current] : []}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {displayImages.map((img, index) => (
              <CarouselItem key={img.id || index}>
                <div className="relative aspect-[4/5] sm:aspect-square bg-muted rounded-xl overflow-hidden border">
                  <ImageWithFallback
                    src={img.url ? (getMediaUrl(img.url) ?? '/avif/placeholder.avif') : '/avif/placeholder.avif'}
                    alt={`${productName} - ${index + 1}`}
                    className="object-cover w-full h-full"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />

                  {hasDiscount && index === 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {displayImages.length > 1 && (
            <>
              <CarouselPrevious
                className={cn(
                  "left-4 transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              />
              <CarouselNext
                className={cn(
                  "right-4 transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              />
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {displayImages.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all",
                current === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
              )}
            >
              <ImageWithFallback
                src={img.url ? (getMediaUrl(img.url) ?? '/avif/placeholder.avif') : '/avif/placeholder.avif'}
                alt={`${productName} thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                fill
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

