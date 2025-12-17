import {
  Box,
  Flex,
  Typography,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Badge,
  Loader,
  Field,
  Dialog,
} from "@strapi/design-system";
import { ArrowLeft, Plus, Pencil, Trash, Search } from "@strapi/icons";
import { NavLink, useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect } from "react";
import { ProductForm } from "../components/ProductForm";

interface ProductsPageProps {
  mode?: "list" | "create" | "edit";
}

interface Product {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: {
    name: string;
  };
  featured: boolean;
  publishedAt: string | null;
}

export const ProductsPage = ({ mode = "list" }: ProductsPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categories, setCategories] = useState<{ id: number; name: string; documentId?: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { get, del } = useFetchClient();

  // Cargar productos y categorías
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar categorías
      const { data: catData } = await get(
        "/content-manager/collection-types/api::category.category?page=1&pageSize=100&sort=name:asc"
      );
      setCategories(catData.results || []);

      // Construir query para productos
      let query = "page=1&pageSize=50&sort=createdAt:desc";
      if (searchTerm) {
        query += `&filters[$or][0][name][$containsi]=${encodeURIComponent(searchTerm)}`;
        query += `&filters[$or][1][sku][$containsi]=${encodeURIComponent(searchTerm)}`;
      }
      if (categoryFilter) {
        query += `&filters[category][id][$eq]=${categoryFilter}`;
      }

      const { data: prodData } = await get(
        `/content-manager/collection-types/api::product.product?${query}`
      );
      setProducts(prodData.results || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, categoryFilter]);

  // Estado para modal de confirmación
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!deleteProduct) return;
    const docId = deleteProduct.documentId || deleteProduct.id;
    setDeleting(true);
    try {
      await del(`/content-manager/collection-types/api::product.product/${docId}`);
      setErrorMsg(null);
      setDeleteProduct(null);
      loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
      setErrorMsg("Error al eliminar el producto");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // Si estamos en modo create o edit, mostrar el formulario
  if (mode === "create" || mode === "edit") {
    return <ProductFormPage mode={mode} />;
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
            onClick={() => navigate(`/plugins/${PLUGIN_ID}`)}
          >
            Volver
          </Button>
          <Typography variant="alpha" fontWeight="bold" style={{ marginBlock: 4 }}>
            📦 Productos
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            Gestiona tu catálogo de productos
          </Typography>
          {errorMsg && (
            <Box padding={2} background="danger100" hasRadius marginTop={2}>
              <Typography textColor="danger600">❌ {errorMsg}</Typography>
            </Box>
          )}
        </Flex>
        <Button
          startIcon={<Plus />}
          onClick={() => navigate(`/plugins/${PLUGIN_ID}/products/new`)}
          size="L"
        >
          Nuevo Producto
        </Button>
      </Flex>

      {/* Filters */}
      <Box
        padding={4}
        background="neutral0"
        shadow="filterShadow"
        borderRadius="8px"
        hasRadius
        marginBottom={4}
      >
        <Flex gap={4} wrap="wrap">
          <Box style={{ flex: '1 1 250px', minWidth: '200px' }}>
            <TextInput
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Box style={{ flex: '0 1 250px', minWidth: '200px' }}>
            <SingleSelect
              placeholder="Filtrar por categoría"
              value={categoryFilter}
              onChange={(value: string | number) => setCategoryFilter(String(value))}
              onClear={() => setCategoryFilter("")}
            >
              <SingleSelectOption value="">Todas</SingleSelectOption>
              {categories.map((cat) => (
                <SingleSelectOption key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
        </Flex>
      </Box>

      {/* Products Table */}
      <Box
        background="neutral0"
        shadow="filterShadow"
        borderRadius="8px"
        hasRadius
        overflow="hidden"
      >
        {loading ? (
          <Flex justifyContent="center" padding={8}>
            <Loader>Cargando productos...</Loader>
          </Flex>
        ) : (
          <Table colCount={7} rowCount={products.length}>
            <Thead>
              <Tr>
                <Th><Typography variant="sigma">SKU</Typography></Th>
                <Th><Typography variant="sigma">Nombre</Typography></Th>
                <Th><Typography variant="sigma">Categoría</Typography></Th>
                <Th><Typography variant="sigma">Precio</Typography></Th>
                <Th><Typography variant="sigma">Stock</Typography></Th>
                <Th><Typography variant="sigma">Estado</Typography></Th>
                <Th><Typography variant="sigma">Acciones</Typography></Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.length === 0 ? (
                <Tr>
                  <Td colSpan={7}>
                    <Flex justifyContent="center" padding={4}>
                      <Typography textColor="neutral600">
                        No hay productos. ¡Crea el primero!
                      </Typography>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                products.map((product) => (
                  <Tr key={product.id}>
                    <Td>
                      <Typography variant="omega" fontWeight="semiBold">
                        {product.sku}
                      </Typography>
                    </Td>
                    <Td>
                      <Flex alignItems="center" gap={2}>
                        <Typography>{product.name}</Typography>
                        {product.featured && (
                          <Badge active>Destacado</Badge>
                        )}
                      </Flex>
                    </Td>
                    <Td>
                      <Typography textColor="neutral600">
                        {product.category?.name || "-"}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography fontWeight="semiBold">
                        ${product.price.toLocaleString("es-AR")}
                      </Typography>
                    </Td>
                    <Td>
                      <Badge
                        backgroundColor={
                          product.stock === 0
                            ? "danger100"
                            : product.stock < 5
                              ? "warning100"
                              : "success100"
                        }
                        textColor={
                          product.stock === 0
                            ? "danger600"
                            : product.stock < 5
                              ? "warning600"
                              : "success600"
                        }
                      >
                        {product.stock}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        backgroundColor={product.publishedAt ? "success100" : "neutral150"}
                        textColor={product.publishedAt ? "success600" : "neutral600"}
                      >
                        {product.publishedAt ? "Publicado" : "Borrador"}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex gap={1}>
                        <IconButton
                          label="Editar"
                          onClick={() => {
                            navigate(`/plugins/${PLUGIN_ID}/products/${product.documentId}`);
                          }}
                        >
                          <Pencil />
                        </IconButton>
                        <IconButton
                          label="Eliminar"
                          onClick={() => setDeleteProduct(product)}
                        >
                          <Trash />
                        </IconButton>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal de confirmación para eliminar */}
      <Dialog.Root open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <Dialog.Content>
          <Dialog.Header>🗑️ Confirmar eliminación</Dialog.Header>
          <Dialog.Body>
            <Typography>
              ¿Estás seguro de eliminar <strong>"{deleteProduct?.name}"</strong>?
            </Typography>
            <Typography variant="pi" textColor="neutral600" marginTop={2}>
              Esta acción no se puede deshacer.
            </Typography>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary" disabled={deleting}>Cancelar</Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button variant="danger" onClick={confirmDelete} loading={deleting}>
                Eliminar
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};

// Usar el componente de formulario real
const ProductFormPage = ({ mode }: { mode: "create" | "edit" }) => {
  return <ProductForm mode={mode} />;
};
