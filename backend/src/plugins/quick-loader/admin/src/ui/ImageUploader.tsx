import React, { useRef, useState } from "react";
import { Box, Flex, Typography, Button, IconButton, Loader } from "@strapi/design-system";
import { Plus, Trash, Star, Upload } from "@strapi/icons";

interface ImageData {
  id: number;
  url: string;
  name: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
}

interface ImageUploaderProps {
  images: ImageData[];
  onUpload: (files: FileList) => void;
  onRemove: (id: number) => void;
  onSetPrimary: (id: number) => void;
  uploading: boolean;
  maxImages?: number;
}

const ImageUploader = ({
  images,
  onUpload,
  onRemove,
  onSetPrimary,
  uploading,
  maxImages = 4,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  const getThumbnail = (img: ImageData) => {
    if (img.formats?.thumbnail?.url) return img.formats.thumbnail.url;
    if (img.formats?.small?.url) return img.formats.small.url;
    return img.url;
  };

  // Ensure config.url is respected if using absolute paths, but usually strapi returns relative or full depending on config.
  // Assuming frontend handles it or we prepend backend URL.
  // In Admin panel, usually relative URLs need prepending if generic upload provider, but cloudinary etc provide full.
  // We'll trust the URL for now or assume a fix is needed if broken.

  // Helper to prepend env var if needed? usually Strapi admin helpers handle this. 
  // For now simple img src.

  return (
    <Box>
      <Typography
        variant="delta"
        fontWeight="semiBold"
        textColor="neutral800"
      >
        Imágenes del Producto ({images.length}/{maxImages})
      </Typography>
      <Box paddingTop={2} paddingBottom={4}>
        <Typography variant="pi" textColor="neutral600">
          Arrastra y suelta imágenes o haz clic para subir. La primera será la portada.
        </Typography>
      </Box>

      {/* Drop Zone */}
      {images.length < maxImages && (
        <Box
          padding={8}
          background={isDragging ? "primary100" : "neutral100"}
          borderColor={isDragging ? "primary600" : "neutral200"}
          style={{
            borderWidth: "2px",
            borderStyle: "dashed",
            borderRadius: "4px",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!uploading ? handleClick : undefined}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={uploading}
          />

          <Flex direction="column" alignItems="center" gap={3}>
            {uploading ? (
              <Loader>Subiendo...</Loader>
            ) : (
              <>
                <Box
                  padding={6}
                  background="primary100"
                  style={{ borderRadius: "50%", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Upload width={64} height={64} color="primary600" />
                </Box>
                <Typography variant="omega" fontWeight="bold" textColor="primary600">
                  Arrastre imágenes aquí
                </Typography>
                <Typography variant="pi" textColor="neutral500">
                  o haga clic para seleccionar (máx. 5MB por imagen)
                </Typography>
              </>
            )}
          </Flex>
        </Box>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <Flex gap={4} wrap="wrap" marginTop={4}>
          {images.map((img, index) => (
            <Box
              key={img.id}
              position="relative"
              borderColor={index === 0 ? "primary600" : "neutral200"}
              background="neutral0"
              shadow="tableShadow"
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "4px",
                borderWidth: "1px",
                borderStyle: "solid",
                overflow: "hidden"
              }}
            >
              {/* Main Image */}
              <img
                src={getThumbnail(img)}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Overlay Actions */}
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)",
                  opacity: 0,
                  transition: "opacity 0.2s"
                }}
                className="image-overlay"
                onMouseEnter={(e: any) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e: any) => e.currentTarget.style.opacity = "0"}
              >
                <Flex
                  justifyContent="space-between"
                  direction="column"
                  height="100%"
                  padding={2}
                  alignItems="flex-end"
                >
                  {/* Top Right: Delete */}
                  <IconButton
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove(img.id); }}
                    label="Eliminar"
                    variant="ghost"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#d02b20' }}
                  >
                    <Trash />
                  </IconButton>

                  {/* Bottom: Make Primary label if not primary */}
                  {index !== 0 && (
                    <Button
                      size="S"
                      variant="secondary"
                      startIcon={<Star />}
                      onClick={() => onSetPrimary(img.id)}
                      fullWidth
                      style={{ background: 'rgba(255,255,255,0.9)', border: 'none' }}
                    >
                      Portada
                    </Button>
                  )}
                </Flex>
              </Box>

              {/* Primary Badge */}
              {index === 0 && (
                <Box
                  position="absolute"
                  top={2}
                  left={2}
                  background="primary600"
                  padding={1}
                  style={{ borderRadius: "4px" }}
                >
                  <Star width={12} height={12} color="neutral0" />
                </Box>
              )}
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default ImageUploader;
