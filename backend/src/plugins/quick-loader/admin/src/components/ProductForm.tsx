import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Grid,
  Field,
  SingleSelect,
  SingleSelectOption,
  Checkbox,
  Loader,
  Tag,
  IconButton,
} from "@strapi/design-system";
import { ArrowLeft, Check, Plus, Cross, Trash, Upload } from "@strapi/icons";
import { useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect, useRef } from "react";
import {
  PREDEFINED_SIZES,
  PREDEFINED_COLORS,
  generateSlug,
  generateSKU,
} from "../constants/productOptions";

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
  const [message, setMessage] = useState<{ type: "error" | "warning" | "success"; text: string } | null>(null);
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
          "/content-manager/collection-types/api::category.category?page=1&pageSize=100&sort=name:asc"
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
            `/content-manager/collection-types/api::product.product/${params.id}`
          );
          // La estructura es: response.data.data (el primer data es del fetch, el segundo de Strapi)
          const productData = response?.data?.data || response?.data || response;

          if (productData && productData.name) {
            // Obtener la categoría desde el endpoint de relaciones
            let categoryId = "";
            try {
              const catResponse = await get(
                `/content-manager/relations/api::product.product/${params.id}/category`
              );
              const catData = catResponse?.data?.results || catResponse?.data || [];
              if (catData.length > 0) {
                categoryId = catData[0].documentId || catData[0].id?.toString() || "";
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
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, customColor] }));
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
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleGenerateSKU = () => {
    const category = categories.find(
      (c) => c.documentId === formData.category || c.id.toString() === formData.category
    );
    const sku = generateSKU(formData.name, category?.name);
    handleChange("sku", sku);
  };

  // Subir imágenes
  const handleImageUpload = async (files: FileList) => {
    const MAX_IMAGES = 4;
    const MAX_SIZE_MB = 3;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Calcular cuántas imágenes podemos agregar
    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setMessage({ type: "warning", text: `Ya tienes ${MAX_IMAGES} imágenes. Elimina alguna para agregar más.` });
      return;
    }

    // Filtrar archivos válidos
    const validFiles = Array.from(files).slice(0, availableSlots).filter((file) => {
      if (file.size > MAX_SIZE_BYTES) {
        setMessage({ type: "warning", text: `"${file.name}" supera los ${MAX_SIZE_MB}MB` });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    try {
      for (const file of validFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append("files", file);

        const { data } = await post("/upload", formDataUpload);
        if (data) {
          setImages((prev) => {
            const newImages = [...prev, ...data];
            // Asegurar que no supere el máximo
            return newImages.slice(0, MAX_IMAGES);
          });
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setMessage({ type: "error", text: "Error al subir imágenes. Verifica que no excedan 3MB." });
    } finally {
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
        await put(`/content-manager/collection-types/api::product.product/${params.id}`, payload);
      } else {
        // Crear producto usando Content Manager
        const response = await post("/content-manager/collection-types/api::product.product", payload);
        const created = response?.data?.data || response?.data;

        // Publicar el producto recién creado
        const docId = created?.documentId;
        if (docId) {
          try {
            await post(`/content-manager/collection-types/api::product.product/${docId}/actions/publish`, {
              documentId: docId
            });
          } catch (publishErr) {
            console.warn("Failed to auto-publish:", publishErr);
          }
        }
      }

      if (createAnother) {
        setFormData(initialFormData);
        setImages([]);
        setMessage({ type: "success", text: "Producto creado. Puedes crear otro." });
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
      <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Flex direction="column" alignItems="flex-start" gap={1}>
          <Button
            variant="tertiary"
            startIcon={<ArrowLeft />}
            onClick={() => navigate(`/plugins/${PLUGIN_ID}/products`)}
          >
            Volver a productos
          </Button>
          <Typography variant="alpha" fontWeight="bold">
            {mode === "create" ? "➕ Nuevo Producto" : "✏️ Editar Producto"}
          </Typography>
        </Flex>
        <Flex gap={2}>
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
            const isDisabled = saving || uploadingImages || !categoriesLoaded || !isFormValid;
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
          background={message.type === "error" ? "danger100" : message.type === "warning" ? "warning100" : "success100"}
          hasRadius
          style={{ borderLeft: `4px solid var(--${message.type === "error" ? "danger" : message.type === "warning" ? "warning" : "success"}600)` }}
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Typography textColor={message.type === "error" ? "danger600" : message.type === "warning" ? "warning600" : "success600"}>
              {message.type === "error" ? "❌" : message.type === "warning" ? "⚠️" : "✅"} {message.text}
            </Typography>
            <Button variant="ghost" size="S" onClick={() => setMessage(null)}>✕</Button>
          </Flex>
        </Box>
      )}

      <Grid.Root gap={6}>
        {/* Columna Principal */}
        <Grid.Item col={8}>
          <Flex direction="column" gap={4}>
            {/* Información Básica */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
                📝 Información Básica
              </Typography>
              <Grid.Root gap={4}>
                <Grid.Item col={12}>
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
                </Grid.Item>
                <Grid.Item col={6}>
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
                      <Button variant="secondary" onClick={handleGenerateSKU} disabled={!formData.name}>
                        Auto
                      </Button>
                    </Flex>
                  </Field.Root>
                </Grid.Item>
                <Grid.Item col={6}>
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
                </Grid.Item>
                <Grid.Item col={12}>
                  <Field.Root>
                    <Field.Label>Descripción</Field.Label>
                    <Textarea
                      placeholder="Descripción del producto..."
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleChange("description", e.target.value)
                      }
                    />
                  </Field.Root>
                </Grid.Item>
              </Grid.Root>
            </Box>

            {/* Imágenes */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
                <Typography variant="delta" fontWeight="semiBold">
                  🖼️ Imágenes (máx 4)
                </Typography>
                <Button
                  variant="secondary"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingImages}
                  disabled={images.length >= 4}
                >
                  Subir
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
              </Flex>

              {images.length === 0 ? (
                <Box
                  padding={4}
                  background="neutral100"
                  borderRadius="4px"
                  hasRadius
                  style={{ border: "2px dashed #ddd", textAlign: "center" }}
                >
                  <Typography textColor="neutral600">
                    Primera imagen = principal. Click "Subir" para agregar.
                  </Typography>
                </Box>
              ) : (
                <Grid.Root gap={3}>
                  {images.map((image, index) => (
                    <Grid.Item key={image.id} col={3}>
                      <Box
                        padding={2}
                        background={index === 0 ? "primary100" : "neutral100"}
                        borderRadius="8px"
                        hasRadius
                        style={{ position: "relative", border: index === 0 ? "2px solid var(--primary600)" : "1px solid #ddd" }}
                      >
                        <img
                          src={image.formats?.small?.url || image.url}
                          alt={image.name}
                          style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                        />
                        {index === 0 && (
                          <Box padding={1} background="primary600" style={{ position: "absolute", top: "4px", left: "4px", borderRadius: "4px" }}>
                            <Typography variant="pi" textColor="neutral0" fontWeight="bold">Principal</Typography>
                          </Box>
                        )}
                        <Flex gap={1} marginTop={2} justifyContent="center">
                          {index !== 0 && (
                            <Button variant="secondary" size="S" onClick={() => setAsPrimary(image.id)}>★</Button>
                          )}
                          <IconButton label="Eliminar" onClick={() => removeImage(image.id)}><Trash /></IconButton>
                        </Flex>
                      </Box>
                    </Grid.Item>
                  ))}
                </Grid.Root>
              )}
            </Box>

            {/* Talles */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={3}>📏 Talles</Typography>
              <Flex wrap="wrap" gap={1} marginBottom={3}>
                {PREDEFINED_SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={formData.sizes.includes(size) ? "default" : "tertiary"}
                    size="S"
                    onClick={() => toggleSize(size)}
                    style={{ minWidth: "40px" }}
                  >
                    {size}
                  </Button>
                ))}
              </Flex>
              <Flex gap={2}>
                <TextInput
                  placeholder="Custom..."
                  value={customSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSize(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
                  style={{ maxWidth: "120px" }}
                />
                <Button variant="secondary" size="S" onClick={addCustomSize} disabled={!customSize}><Plus /></Button>
              </Flex>
              {formData.sizes.length > 0 && (
                <Typography variant="pi" textColor="primary600" marginTop={2}>✓ {formData.sizes.join(", ")}</Typography>
              )}
            </Box>

            {/* Colores */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={3}>🎨 Colores</Typography>
              <Flex wrap="wrap" gap={1} marginBottom={3}>
                {PREDEFINED_COLORS.map((color) => (
                  <Button
                    key={color.name}
                    variant={formData.colors.includes(color.name) ? "default" : "tertiary"}
                    size="S"
                    onClick={() => toggleColor(color.name)}
                    style={{ paddingLeft: "22px", position: "relative" }}
                  >
                    <span style={{ position: "absolute", left: "5px", width: "12px", height: "12px", borderRadius: "50%", background: color.hex, border: "1px solid rgba(0,0,0,0.2)" }} />
                    {color.name}
                  </Button>
                ))}
              </Flex>
              <Flex gap={2}>
                <TextInput
                  placeholder="Custom..."
                  value={customColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomColor(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && (e.preventDefault(), addCustomColor())}
                  style={{ maxWidth: "120px" }}
                />
                <Button variant="secondary" size="S" onClick={addCustomColor} disabled={!customColor}><Plus /></Button>
              </Flex>
              {formData.colors.length > 0 && (
                <Typography variant="pi" textColor="primary600" marginTop={2}>✓ {formData.colors.join(", ")}</Typography>
              )}
            </Box>

            {/* Tags */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={3}>🏷️ Etiquetas</Typography>
              <Flex gap={2} marginBottom={3}>
                <TextInput
                  placeholder="Verano 2024, Oferta..."
                  value={customTag}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTag(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button variant="secondary" onClick={addTag} disabled={!customTag}><Plus /></Button>
              </Flex>
              {formData.tags.length > 0 && (
                <Flex wrap="wrap" gap={2}>
                  {formData.tags.map((tag) => (
                    <Tag key={tag} icon={<Cross />} onClick={() => removeTag(tag)}>{tag}</Tag>
                  ))}
                </Flex>
              )}
            </Box>
          </Flex>
        </Grid.Item>

        {/* Columna Lateral */}
        <Grid.Item col={4}>
          <Flex direction="column" gap={4}>
            {/* Precios */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>💰 Precios</Typography>
              <Flex direction="column" gap={3}>
                <Field.Root required>
                  <Field.Label>Precio</Field.Label>
                  <NumberInput value={formData.price} onValueChange={(v: number | undefined) => handleChange("price", v ?? 0)} step={100} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Precio Anterior</Field.Label>
                  <NumberInput value={formData.comparePrice ?? undefined} onValueChange={(v: number | undefined) => handleChange("comparePrice", v || null)} step={100} />
                  <Typography variant="pi" textColor="neutral500">Se muestra tachado</Typography>
                </Field.Root>
              </Flex>
            </Box>

            {/* Stock */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>📦 Stock</Typography>
              <NumberInput value={formData.stock} onValueChange={(v: number | undefined) => handleChange("stock", v ?? 0)} step={1} />
            </Box>

            {/* Categoría */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>📁 Categoría</Typography>
              <SingleSelect
                placeholder="Seleccionar..."
                value={formData.category}
                onChange={(v: string | number) => handleChange("category", String(v))}
                onClear={() => handleChange("category", "")}
              >
                {categories.map((cat) => (
                  <SingleSelectOption key={cat.id} value={cat.documentId || cat.id.toString()}>{cat.name}</SingleSelectOption>
                ))}
              </SingleSelect>
            </Box>

            {/* Opciones */}
            <Box padding={5} background="neutral0" shadow="filterShadow" borderRadius="8px" hasRadius>
              <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>⚙️ Opciones</Typography>
              <Checkbox checked={formData.featured} onCheckedChange={(c: boolean) => handleChange("featured", c)}>
                <Typography fontWeight="semiBold">Destacado</Typography>
              </Checkbox>
              <Typography variant="pi" textColor="neutral500" marginTop={1}>Aparece en el carousel</Typography>
            </Box>
          </Flex>
        </Grid.Item>
      </Grid.Root>
    </Box>
  );
};
