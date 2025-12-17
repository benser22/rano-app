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
  Badge,
  Loader,
  Modal,
  Dialog,
  Field,
} from "@strapi/design-system";
import { ArrowLeft, Plus, Pencil, Trash } from "@strapi/icons";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect } from "react";

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  productsCount?: number;
}

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const navigate = useNavigate();
  const { get, post, put, del } = useFetchClient();

  const [saving, setSaving] = useState(false);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const { data } = await get(
        "/content-manager/collection-types/api::category.category?page=1&pageSize=100&sort=name:asc"
      );
      const categoriesWithCount = (data.results || []).map((cat: any) => ({
        ...cat,
        productsCount: cat.products?.length || 0,
      }));
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Guardar categoría
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingCategory) {
        await put(
          `/content-manager/collection-types/api::category.category/${editingCategory.documentId || editingCategory.id}`,
          formData
        );
      } else {
        await post("/content-manager/collection-types/api::category.category", formData);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  // Estado para modal de eliminación
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!deleteCategory) return;
    setDeleting(true);
    try {
      await del(
        `/content-manager/collection-types/api::category.category/${deleteCategory.documentId || deleteCategory.id}`
      );
      setDeleteCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

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
            📁 Categorías
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            Organiza tus productos en categorías
          </Typography>
        </Flex>
        <Button onClick={handleOpenCreate} startIcon={<Plus />} size="L">
          Nueva Categoría
        </Button>
      </Flex>

      {/* Categories Table */}
      <Box
        background="neutral0"
        shadow="filterShadow"
        borderRadius="8px"
        hasRadius
        overflow="hidden"
      >
        {loading ? (
          <Flex justifyContent="center" padding={8}>
            <Loader>Cargando categorías...</Loader>
          </Flex>
        ) : (
          <Table colCount={4} rowCount={categories.length}>
            <Thead>
              <Tr>
                <Th><Typography variant="sigma">Nombre</Typography></Th>
                <Th><Typography variant="sigma">Slug</Typography></Th>
                <Th><Typography variant="sigma">Productos</Typography></Th>
                <Th><Typography variant="sigma">Acciones</Typography></Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.length === 0 ? (
                <Tr>
                  <Td colSpan={4}>
                    <Flex justifyContent="center" padding={4}>
                      <Typography textColor="neutral600">
                        No hay categorías. ¡Crea la primera!
                      </Typography>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                categories.map((category) => (
                  <Tr key={category.id}>
                    <Td>
                      <Typography fontWeight="semiBold">{category.name}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral600">{category.slug}</Typography>
                    </Td>
                    <Td>
                      <Badge>{category.productsCount || 0} productos</Badge>
                    </Td>
                    <Td>
                      <Flex gap={1}>
                        <IconButton label="Editar" onClick={() => handleOpenEdit(category)}>
                          <Pencil />
                        </IconButton>
                        <IconButton
                          label="Eliminar"
                          onClick={() => setDeleteCategory(category)}
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

      {/* Modal para crear/editar */}
      {isModalOpen && (
        <Modal.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Modal.Content style={{ maxWidth: "600px" }}>
            <Modal.Header>
              <Modal.Title>
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Flex direction="column" gap={4}>
                <Field.Root>
                  <Field.Label>Nombre</Field.Label>
                  <TextInput
                    placeholder="Ej: Remeras"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const name = e.target.value;
                      setFormData({
                        name,
                        slug: editingCategory ? formData.slug : generateSlug(name),
                      });
                    }}
                    required
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Slug (URL)</Field.Label>
                  <TextInput
                    placeholder="ej: remeras"
                    value={formData.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                  <Typography variant="pi" textColor="neutral600">Se usa en la URL de la categoría</Typography>
                </Field.Root>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close>
                <Button variant="tertiary">Cancelar</Button>
              </Modal.Close>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.slug}
                loading={saving}
              >
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      )}

      {/* Modal de confirmación para eliminar */}
      <Dialog.Root open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <Dialog.Content>
          <Dialog.Header>🗑️ Confirmar eliminación</Dialog.Header>
          <Dialog.Body>
            <Typography>
              ¿Estás seguro de eliminar <strong>"{deleteCategory?.name}"</strong>?
            </Typography>
            {(deleteCategory?.productsCount ?? 0) > 0 && (
              <Typography variant="pi" textColor="warning600" marginTop={2}>
                ⚠️ Esta categoría tiene {deleteCategory?.productsCount} producto(s) asociado(s).
              </Typography>
            )}
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
