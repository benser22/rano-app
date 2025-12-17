import { Box, Flex, Typography, Grid, Button, Loader } from "@strapi/design-system";
import { ShoppingCart, Folder, Cog, Plus } from "@strapi/icons";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect } from "react";

interface Stats {
  products: number;
  categories: number;
  lowStock: number;
  noStock: number;
  paidOrders: number;
  monthlyOrders: number;
  totalSales: number;
  monthlySales: number;
}

export const HomePage = () => {
  const navigate = useNavigate();
  const { get } = useFetchClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Usar Content Manager API directamente
        const [prodRes, catRes, ordersRes] = await Promise.all([
          get("/content-manager/collection-types/api::product.product?page=1&pageSize=1"),
          get("/content-manager/collection-types/api::category.category?page=1&pageSize=1"),
          get("/content-manager/collection-types/api::order.order?page=1&pageSize=1000&filters[status][$in][0]=paid&filters[status][$in][1]=completed").catch(() => null),
        ]);

        const products = prodRes?.data?.pagination?.total || 0;
        const categories = catRes?.data?.pagination?.total || 0;

        // Calcular ventas de órdenes
        let paidOrders = 0;
        let totalSales = 0;
        let monthlyOrders = 0;
        let monthlySales = 0;

        if (ordersRes?.data?.results) {
          const orders = ordersRes.data.results;
          paidOrders = orders.length;
          totalSales = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

          // Calcular del mes
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const monthlyOrdersList = orders.filter((o: any) => new Date(o.createdAt) >= startOfMonth);
          monthlyOrders = monthlyOrdersList.length;
          monthlySales = monthlyOrdersList.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        }

        // Contar stock bajo
        const lowStockRes = await get("/content-manager/collection-types/api::product.product?page=1&pageSize=1&filters[stock][$gte]=1&filters[stock][$lt]=5").catch(() => null);
        const noStockRes = await get("/content-manager/collection-types/api::product.product?page=1&pageSize=1&filters[stock][$eq]=0").catch(() => null);

        setStats({
          products,
          categories,
          lowStock: lowStockRes?.data?.pagination?.total || 0,
          noStock: noStockRes?.data?.pagination?.total || 0,
          paidOrders,
          monthlyOrders,
          totalSales,
          monthlySales,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [get]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box padding={8} background="neutral100">
      {/* Header */}
      <Flex direction="column" alignItems="flex-start" gap={2} marginBottom={6}>
        <Typography variant="alpha" fontWeight="bold">
          ⚡ Quick Loader
        </Typography>
        <Typography variant="epsilon" textColor="neutral600">
          Panel de carga rápida de productos y gestión de tienda
        </Typography>
      </Flex>

      {/* Quick Actions */}
      <Grid.Root gap={4} marginBottom={6}>
        <Grid.Item col={4}>
          <Box
            padding={5}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Flex direction="column" alignItems="center" gap={3}>
              <Box
                padding={3}
                background="primary100"
                style={{
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart width={32} height={32} color="primary600" />
              </Box>
              <Typography variant="delta" fontWeight="semiBold">
                Productos
              </Typography>
              <Typography variant="pi" textColor="neutral600" textAlign="center">
                Carga y gestiona productos de forma rápida
              </Typography>
              <Flex gap={2}>
                <Button
                  startIcon={<Plus />}
                  size="S"
                  onClick={() => navigate(`/plugins/${PLUGIN_ID}/products/new`)}
                >
                  Nuevo
                </Button>
                <Button
                  variant="secondary"
                  size="S"
                  onClick={() => navigate(`/plugins/${PLUGIN_ID}/products`)}
                >
                  Ver todos
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Grid.Item>

        <Grid.Item col={4}>
          <Box
            padding={5}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Flex direction="column" alignItems="center" gap={3}>
              <Box
                padding={3}
                background="success100"
                style={{
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Folder width={32} height={32} color="success600" />
              </Box>
              <Typography variant="delta" fontWeight="semiBold">
                Categorías
              </Typography>
              <Typography variant="pi" textColor="neutral600" textAlign="center">
                Organiza tus productos en categorías
              </Typography>
              <Button
                variant="secondary"
                size="S"
                onClick={() => navigate(`/plugins/${PLUGIN_ID}/categories`)}
              >
                Gestionar
              </Button>
            </Flex>
          </Box>
        </Grid.Item>

        <Grid.Item col={4}>
          <Box
            padding={5}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Flex direction="column" alignItems="center" gap={3}>
              <Box
                padding={3}
                background="warning100"
                style={{
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cog width={32} height={32} color="warning600" />
              </Box>
              <Typography variant="delta" fontWeight="semiBold">
                Configuración
              </Typography>
              <Typography variant="pi" textColor="neutral600" textAlign="center">
                Datos de contacto, envíos y redes
              </Typography>
              <Button
                variant="secondary"
                size="S"
                onClick={() => navigate(`/plugins/${PLUGIN_ID}/config`)}
              >
                Editar
              </Button>
            </Flex>
          </Box>
        </Grid.Item>
      </Grid.Root>

      {loading ? (
        <Flex justifyContent="center" padding={8}>
          <Loader>Cargando estadísticas...</Loader>
        </Flex>
      ) : (
        <>
          {/* Resumen de Ventas */}
          <Box
            padding={5}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
            marginBottom={4}
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              💰 Resumen de Ventas
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={3}>
                <Box padding={4} background="success100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Ventas Totales
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="success700">
                      {formatCurrency(stats?.totalSales ?? 0)}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="primary100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Ventas del Mes
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="primary700">
                      {formatCurrency(stats?.monthlySales ?? 0)}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="secondary100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Órdenes Pagadas
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="secondary700">
                      {stats?.paidOrders ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="alternative100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Órdenes del Mes
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="alternative700">
                      {stats?.monthlyOrders ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
            </Grid.Root>
          </Box>

          {/* Resumen de Productos */}
          <Box
            padding={5}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              📊 Resumen de Productos
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={3}>
                <Box padding={4} background="primary100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Total Productos
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="primary600">
                      {stats?.products ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="success100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Categorías
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="success600">
                      {stats?.categories ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="warning100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Stock Bajo
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="warning600">
                      {stats?.lowStock ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
              <Grid.Item col={3}>
                <Box padding={4} background="danger100" borderRadius="8px" hasRadius>
                  <Flex direction="column" gap={1}>
                    <Typography variant="pi" textColor="neutral600">
                      Sin Stock
                    </Typography>
                    <Typography variant="beta" fontWeight="bold" textColor="danger600">
                      {stats?.noStock ?? 0}
                    </Typography>
                  </Flex>
                </Box>
              </Grid.Item>
            </Grid.Root>
          </Box>
        </>
      )}
    </Box>
  );
};
