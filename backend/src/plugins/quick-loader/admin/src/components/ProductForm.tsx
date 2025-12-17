import {
  Box,
  Button,
  Checkbox,
  Field,
  Flex,
  Grid,
  Loader,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  Tag,
  TextInput,
  Textarea,
  Typography
} from "@strapi/design-system";
import { ArrowLeft, Check, Cross, Plus } from "@strapi/icons";
import { useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { useEffect, useRef, useState } from "react";
import {
  PREDEFINED_COLORS,
  PREDEFINED_SIZES,
  PREDEFINED_TAGS,
  generateSKU,
  generateSlug,
} from "../constants/productOptions";
import { PLUGIN_ID } from "../pluginId";
import { ImageUploader, CustomGrid, GridItem, SectionCard, RowContainer } from "../ui";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  sku: string;
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  featured: boolean;
  category: string;
}

interface Category {
  id: number;
  documentId: string;
  name: string;
}

interface ImageData {
  id: number;
  url: string;
  name: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
}

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  comparePrice: null,
  sku: "",
  stock: 0,
  sizes: [],
  colors: [],
  tags: [],
  featured: false,
  category: "",
};

interface ProductFormProps {
  mode: "create" | "edit";
}

export const ProductForm = ({ mode }: ProductFormProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const { get, post, put } = useFetchClient();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [customSize, setCustomSize] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "warning" | "success";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide message after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await get(
          "/content-manager/collection-types/api::category.category?page=1&pageSize=100&sort=name:asc",
        );
        setCategories(data.results || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoaded(true);
      }
    };
    loadCategories();
  }, [get]);

  // Cargar producto si estamos editando
  useEffect(() => {
    if (mode === "edit" && params.id) {
      const loadProduct = async () => {
        try {
          const response = await get(
            `/content-manager/collection-types/api::product.product/${params.id}`,
          );
          // La estructura es: response.data.data (el primer data es del fetch, el segundo de Strapi)
          const productData =
            response?.data?.data || response?.data || response;

          if (productData && productData.name) {
            // Obtener la categoría desde el endpoint de relaciones
            let categoryId = "";
            try {
              const catResponse = await get(
                `/content-manager/relations/api::product.product/${params.id}/category`,
              );
              const catData =
                catResponse?.data?.results || catResponse?.data || [];
              if (catData.length > 0) {
                categoryId =
                  catData[0].documentId || catData[0].id?.toString() || "";
              }
            } catch (catErr) {
              console.warn("Could not load category relation:", catErr);
            }

            setFormData({
              name: productData.name || "",
              slug: productData.slug || "",
              description: productData.description || "",
              price: productData.price || 0,
              comparePrice: productData.comparePrice || null,
              sku: productData.sku || "",
              stock: productData.stock || 0,
              sizes: productData.sizes || [],
              colors: productData.colors || [],
              tags: productData.tags || [],
              featured: productData.featured || false,
              category: categoryId,
            });
            if (productData.images) {
              setImages(productData.images);
            }
          } else {
            console.error("No product data found in response:", response);
          }
        } catch (error) {
          console.error("Error loading product:", error);
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [mode, params.id, get]);

  // Actualizar campo
  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && mode === "create") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Toggle tamaño
  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, customSize] }));
      setCustomSize("");
    }
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, customColor],
      }));
      setCustomColor("");
    }
  };

  const addTag = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, customTag] }));
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleGenerateSKU = () => {
    const category = categories.find(
      (c) =>
        c.documentId === formData.category ||
        c.id.toString() === formData.category,
    );
    const sku = generateSKU(formData.name, category?.name);
    handleChange("sku", sku);
  };

  // Subir imágenes
  const handleImageUpload = async (files: FileList) => {
    const MAX_IMAGES = 4;
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Validar que haya archivos
    if (!files || files.length === 0) return;

    // Calcular cuántas imágenes podemos agregar
    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setMessage({
        type: "warning",
        text: `Ya tienes ${MAX_IMAGES} imágenes. Elimina alguna para agregar más.`,
      });
      return;
    }

    // Convertir a array
    const filesArray = Array.from(files);

    // Mostrar aviso si intentan subir más de lo permitido
    if (filesArray.length > availableSlots) {
      setMessage({
        type: "warning",
        text: `Solo se subirán ${availableSlots} de las ${filesArray.length} imágenes seleccionadas.`,
      });
    }

    // Tomar solo los archivos que caben
    const toUpload = filesArray.slice(0, availableSlots);

    // Validar tamaños
    const validFiles = toUpload.filter(f => {
      if (f.size > MAX_SIZE_BYTES) {
        console.log(`Archivo ${f.name} excede ${MAX_SIZE_MB}MB: ${(f.size / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }
      return true;
    });

    const oversized = toUpload.filter(f => f.size > MAX_SIZE_BYTES);
    if (oversized.length > 0) {
      setMessage({
        type: "warning",
        text: `${oversized.length} archivo(s) exceden ${MAX_SIZE_MB}MB y fueron omitidos.`,
      });
    }

    if (validFiles.length === 0) {
      return;
    }

    setUploadingImages(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload files one by one with individual error handling
      for (const file of validFiles) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append("files", file);

          const { data } = await post("/upload", formDataUpload);
          if (data && Array.isArray(data) && data.length > 0) {
            setImages((prev) => {
              const newImages = [...prev, ...data];
              return newImages.slice(0, MAX_IMAGES);
            });
            successCount++;
          }
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          errorCount++;
        }
      }

      // Show result message
      if (successCount > 0 && errorCount === 0) {
        setMessage({
          type: "success",
          text: `${successCount} imagen(es) subida(s) correctamente.`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        setMessage({
          type: "warning",
          text: `${successCount} imagen(es) subida(s), ${errorCount} con error.`,
        });
      } else if (errorCount > 0) {
        setMessage({
          type: "error",
          text: `Error al subir ${errorCount} imagen(es). Intenta de nuevo.`,
        });
      }
    } catch (error) {
      console.error("Error general uploading images:", error);
      setMessage({
        type: "error",
        text: "Error inesperado. Intenta de nuevo.",
      });
    } finally {
      // ALWAYS reset uploading state
      setUploadingImages(false);
    }
  };

  // Eliminar imagen
  const removeImage = (imageId: number) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Mover imagen a principal
  const setAsPrimary = (imageId: number) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === imageId);
      if (!image) return prev;
      return [image, ...prev.filter((img) => img.id !== imageId)];
    });
  };

  // Guardar producto
  const handleSave = async (createAnother = false) => {
    // Validación adicional por seguridad
    const isFormValid =
      formData.name.trim() !== "" &&
      formData.sku.trim() !== "" &&
      formData.price > 0 &&
      formData.stock >= 0 &&
      formData.category !== "" &&
      formData.sizes.length > 0 &&
      formData.colors.length > 0;
    if (!isFormValid) {
      setMessage({
        type: "warning",
        text: "Formulario incompleto: completa los campos requeridos.",
      });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        comparePrice: formData.comparePrice,
        sku: formData.sku,
        stock: formData.stock,
        sizes: formData.sizes,
        colors: formData.colors,
        tags: formData.tags,
        featured: formData.featured,
        images: images.map((img) => img.id),
      };

      if (formData.category) {
        payload.category = formData.category;
      }

      if (mode === "edit") {
        await put(
          `/content-manager/collection-types/api::product.product/${params.id}`,
          payload,
        );
      } else {
        // Crear producto usando Content Manager
        const response = await post(
          "/content-manager/collection-types/api::product.product",
          payload,
        );
        const created = response?.data?.data || response?.data;

        // Publicar el producto recién creado
        const docId = created?.documentId;
        if (docId) {
          try {
            await post(
              `/content-manager/collection-types/api::product.product/${docId}/actions/publish`,
              {
                documentId: docId,
              },
            );
          } catch (publishErr) {
            console.warn("Failed to auto-publish:", publishErr);
          }
        }
      }

      if (createAnother) {
        setFormData(initialFormData);
        setImages([]);
        setMessage({
          type: "success",
          text: "Producto creado. Puedes crear otro.",
        });
      } else {
        // Navegar con delay para evitar abort
        setSaving(false);
        setTimeout(() => navigate(`/plugins/${PLUGIN_ID}/products`), 100);
        return;
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage({ type: "error", text: "Error al guardar el producto" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box padding={8} background="neutral100">
        <Flex justifyContent="center" padding={8}>
          <Loader>Cargando producto...</Loader>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8} background="neutral100">
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        marginBottom={6}
        wrap="wrap"
        gap={4}
      >
        <Flex direction="column" alignItems="flex-start" gap={1}>
          <Button
            variant="tertiary"
            startIcon={<ArrowLeft />}
            onClick={() => navigate(`/plugins/${PLUGIN_ID}/products`)}
          >
            Volver a productos
          </Button>
          <Typography style={{ marginBlock: 4 }} variant="alpha" fontWeight="bold">
            {mode === "create" ? "➕ Nuevo Producto" : "✏️ Editar Producto"}
          </Typography>
        </Flex>
        <Flex gap={2} wrap="wrap" style={{ flex: '1 1 auto', justifyContent: 'flex-end' }}>
          {/* Validaciones: nombre, SKU, precio > 0, stock >= 0, categoría, al menos 1 talle, al menos 1 color */}
          {(() => {
            const isFormValid =
              formData.name.trim() !== "" &&
              formData.sku.trim() !== "" &&
              formData.price > 0 &&
              formData.stock >= 0 &&
              formData.category !== "" &&
              formData.sizes.length > 0 &&
              formData.colors.length > 0;
            const isDisabled =
              saving || uploadingImages || !categoriesLoaded || !isFormValid;
            return (
              <>
                {mode === "create" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleSave(true)}
                    disabled={isDisabled}
                    loading={saving}
                  >
                    Guardar y Crear Otro
                  </Button>
                )}
                <Button
                  startIcon={<Check />}
                  onClick={() => handleSave(false)}
                  disabled={isDisabled}
                  loading={saving}
                >
                  {mode === "create" ? "Crear Producto" : "Guardar Cambios"}
                </Button>
              </>
            );
          })()}
        </Flex>
      </Flex>

      {/* Mensaje de feedback */}
      {message && (
        <Box
          padding={3}
          marginBottom={4}
          background={
            message.type === "error"
              ? "danger100"
              : message.type === "warning"
                ? "warning100"
                : "success100"
          }
          hasRadius
          style={{
            borderLeft: `4px solid var(--${message.type === "error" ? "danger" : message.type === "warning" ? "warning" : "success"}600)`,
          }}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Typography
              textColor={
                message.type === "error"
                  ? "danger600"
                  : message.type === "warning"
                    ? "warning600"
                    : "success600"
              }
            >
              {message.type === "error"
                ? "❌"
                : message.type === "warning"
                  ? "⚠️"
                  : "✅"}{" "}
              {message.text}
            </Typography>
            <Button variant="ghost" size="S" onClick={() => setMessage(null)}>
              ✕
            </Button>
          </Flex>
        </Box>
      )}

      {/* Main Layout - 3 Rows with equal height cards */}
      <Flex direction="column" gap={4}>

        {/* FILA 1: Info + Imágenes */}
        <RowContainer>
          <SectionCard title="📝 Información Básica">
            <CustomGrid $cols={2} $tabletCols={2} $mobileCols={1}>
              <Box style={{ gridColumn: 'span 2' }}>
                <Field.Root required>
                  <Field.Label>Nombre del Producto</Field.Label>
                  <TextInput
                    placeholder="Ej: Remera Oversize Algodón"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("name", e.target.value)
                    }
                  />
                </Field.Root>
              </Box>

              <Flex wrap="wrap" gap={4} style={{ gridColumn: 'span 2' }}>
                <Box style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Field.Root required>
                    <Field.Label>SKU</Field.Label>
                    <Flex gap={2}>
                      <Box flex={1}>
                        <TextInput
                          placeholder="REM-OVS-001"
                          value={formData.sku}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("sku", e.target.value)
                          }
                        />
                      </Box>
                      <Button
                        variant="secondary"
                        onClick={handleGenerateSKU}
                        size="L"
                        disabled={!formData.name.trim()}
                        title={!formData.name.trim() ? "Ingresa un nombre primero" : "Generar SKU automático"}
                      >
                        Auto
                      </Button>
                    </Flex>
                  </Field.Root>
                </Box>

                <Box style={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Field.Root>
                    <Field.Label>Slug (URL)</Field.Label>
                    <TextInput
                      placeholder="remera-oversize-algodon"
                      value={formData.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("slug", e.target.value)
                      }
                    />
                  </Field.Root>
                </Box>
              </Flex>

              <Box style={{ gridColumn: 'span 2' }}>
                <Field.Root>
                  <Field.Label>Descripción</Field.Label>
                  <Textarea
                    placeholder="Descripción del producto..."
                    value={formData.description}
                    resizable={false}
                    rows={8}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("description", e.target.value)
                    }
                  />
                </Field.Root>
              </Box>
            </CustomGrid>
          </SectionCard>

          <SectionCard title="📸 Imágenes">
            <ImageUploader
              images={images}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              onSetPrimary={setAsPrimary}
              uploading={uploadingImages}
              maxImages={4}
            />
          </SectionCard>
        </RowContainer>

        {/* FILA 2: Precios | Categoría | Opciones | Tags */}
        <RowContainer>
          <SectionCard title="💰 Precios y Stock">
            <Flex direction="column" gap={3}>
              <Field.Root required>
                <Field.Label>Precio</Field.Label>
                <NumberInput
                  value={formData.price}
                  onValueChange={(v: number | undefined) =>
                    handleChange("price", v ?? 0)
                  }
                  step={100}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Stock</Field.Label>
                <NumberInput
                  value={formData.stock}
                  onValueChange={(v: number | undefined) =>
                    handleChange("stock", v ?? 0)
                  }
                  step={1}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Comparar (Tachado)</Field.Label>
                <NumberInput
                  value={formData.comparePrice ?? undefined}
                  onValueChange={(v: number | undefined) =>
                    handleChange("comparePrice", v || null)
                  }
                  step={100}
                />
              </Field.Root>
            </Flex>
          </SectionCard>

          <SectionCard title="📁 Categoría">
            <Flex direction="column" gap={3} alignItems="center">
              <Box
                style={{
                  fontSize: '96px',
                  opacity: formData.category ? 1 : 0.4,
                  lineHeight: 1,
                  transition: 'opacity 0.2s',
                }}
              >
                📂
              </Box>
              <SingleSelect
                placeholder="Seleccionar categoría..."
                value={formData.category}
                onChange={(v: string | number) =>
                  handleChange("category", String(v))
                }
                onClear={() => handleChange("category", "")}
              >
                {categories.map((cat) => (
                  <SingleSelectOption
                    key={cat.id}
                    value={cat.documentId || cat.id.toString()}
                  >
                    {cat.name}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
              <Typography variant="pi" textColor="neutral500">
                Organiza tu producto en el catálogo
              </Typography>
            </Flex>
          </SectionCard>

          <SectionCard title="⚙️ Opciones">
            <Flex direction="column" gap={3} alignItems="center">
              {/* Mini carousel visual */}
              <Box
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'rgba(79, 70, 229, 0.1)',
                  borderRadius: '8px',
                  opacity: formData.featured ? 1 : 0.4,
                  transition: 'opacity 0.2s',
                }}
              >
                <Box style={{ width: '64px', height: '96px', background: 'rgba(79, 70, 229, 0.3)', borderRadius: '4px' }} />
                <Box style={{ width: '64px', height: '96px', background: 'rgba(79, 70, 229, 0.6)', borderRadius: '4px', transform: 'scale(1.1)' }} />
                <Box style={{ width: '64px', height: '96px', background: 'rgba(79, 70, 229, 0.3)', borderRadius: '4px' }} />
              </Box>
              <Box>
                <Checkbox
                  checked={formData.featured}
                  onCheckedChange={(c: boolean) => handleChange("featured", c)}
                >
                  <Typography fontWeight="semiBold">⭐ Destacado</Typography>
                </Checkbox>
                <Typography variant="pi" textColor="neutral500" paddingLeft={6}>
                  Aparece en el carousel principal
                </Typography>
              </Box>
            </Flex>
          </SectionCard>

          <SectionCard title="🏷️ Etiquetas">
            <Flex wrap="wrap" gap={1} marginBottom={3}>
              {PREDEFINED_TAGS.map((tag) => (
                <Button
                  key={tag}
                  variant={
                    formData.tags.includes(tag) ? "default" : "tertiary"
                  }
                  size="S"
                  onClick={() => {
                    if (formData.tags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                    }
                  }}
                >
                  {tag}
                </Button>
              ))}
            </Flex>
            <Flex gap={4} alignItems="stretch">
              <Box flex={1}>
                <TextInput
                  placeholder="Etiqueta personalizada..."
                  value={customTag}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomTag(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
              </Box>
              <Button
                variant="secondary"
                onClick={addTag}
                disabled={!customTag}
                style={{ height: 'auto' }}
              >
                <Plus />
              </Button>
            </Flex>
            {formData.tags.length > 0 && (
              <Box marginTop={4}>
                <Typography variant="pi" textColor="neutral600" marginBottom={2}>
                  Etiquetas seleccionadas:
                </Typography>
                <Flex wrap="wrap" gap={2}>
                  {formData.tags.map((tag) => (
                    <Tag
                      key={tag}
                      icon={<Cross />}
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </SectionCard>
        </RowContainer>

        {/* FILA 3: Talles | Colores */}
        <RowContainer>
          <SectionCard title="📏 Talles" style={{ flex: '1 1 0' }}>
            <Flex wrap="wrap" gap={1} marginBottom={3}>
              {PREDEFINED_SIZES.map((size) => (
                <Button
                  key={size}
                  variant={
                    formData.sizes.includes(size) ? "default" : "tertiary"
                  }
                  size="S"
                  onClick={() => toggleSize(size)}
                  style={{ minWidth: "40px" }}
                >
                  {size}
                </Button>
              ))}
            </Flex>
            <Flex gap={2} alignItems="stretch">
              <Box flex={1}>
                <TextInput
                  placeholder="Talle personalizado..."
                  value={customSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomSize(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomSize())
                  }
                />
              </Box>
              <Button
                variant="secondary"
                onClick={addCustomSize}
                disabled={!customSize}
                style={{ height: 'auto' }}
              >
                <Plus />
              </Button>
            </Flex>
            {formData.sizes.length > 0 && (
              <Box marginTop={4}>
                <Typography variant="pi" textColor="neutral600" marginBottom={2}>
                  Talles seleccionados:
                </Typography>
                <Flex wrap="wrap" gap={2}>
                  {formData.sizes.map((size) => (
                    <Tag
                      key={size}
                      icon={<Cross />}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </SectionCard>

          <SectionCard title="🎨 Colores" style={{ flex: '1.5 1 0' }}>
            <Flex wrap="wrap" gap={1} marginBottom={3}>
              {PREDEFINED_COLORS.map((color) => (
                <Button
                  key={color.name}
                  variant={
                    formData.colors.includes(color.name)
                      ? "default"
                      : "tertiary"
                  }
                  size="S"
                  onClick={() => toggleColor(color.name)}
                  style={{ paddingLeft: "22px", position: "relative" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "5px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: color.hex,
                      border: "1px solid rgba(0,0,0,0.2)",
                    }}
                  />
                  {color.name}
                </Button>
              ))}
            </Flex>
            <Flex gap={2} alignItems="stretch">
              <Box flex={1}>
                <TextInput
                  placeholder="Color personalizado..."
                  value={customColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomColor(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomColor())
                  }
                />
              </Box>
              <Button
                variant="secondary"
                onClick={addCustomColor}
                disabled={!customColor}
                style={{ height: 'auto' }}
              >
                <Plus />
              </Button>
            </Flex>
            {formData.colors.length > 0 && (
              <Box marginTop={4}>
                <Typography variant="pi" textColor="neutral600" marginBottom={2}>
                  Colores seleccionados:
                </Typography>
                <Flex wrap="wrap" gap={2}>
                  {formData.colors.map((color) => (
                    <Tag
                      key={color}
                      icon={<Cross />}
                      onClick={() => toggleColor(color)}
                    >
                      {color}
                    </Tag>
                  ))}
                </Flex>
              </Box>
            )}
          </SectionCard>
        </RowContainer>

      </Flex>
    </Box>
  );
};
