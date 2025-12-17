import { Box, Flex, Typography, Grid, Button, Loader } from "@strapi/design-system";
import { ShoppingCart, Folder, Cog, Plus } from "@strapi/icons";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect } from "react";
import { ActionCard, SectionCard, StatCard, CustomGrid } from "../ui";
import styled from "styled-components";

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
      <SectionCard title="🚀 Acciones Rápidas">
        <CustomGrid $cols={3}>
          <Box height="100%">
            <ActionCard
              title="Productos"
              description="Carga y gestiona productos de forma rápida"
              icon={<ShoppingCart width={32} height={32} color="primary600" />}
              iconBg="primary100"
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%" }}>
                <Button
                  variant="default"
                  startIcon={<Plus />}
                  onClick={() => navigate(`/plugins/${PLUGIN_ID}/products/new`)}
                  style={{ flex: "1 1 auto", minWidth: "100px" }}
                >
                  Nuevo
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/plugins/${PLUGIN_ID}/products`)}
                  style={{ flex: "1 1 auto", minWidth: "100px" }}
                >
                  Ver todos
                </Button>
              </div>
            </ActionCard>
          </Box>

          <Box height="100%">
            <ActionCard
              title="Categorías"
              description="Organiza tus productos en categorías"
              icon={<Folder width={32} height={32} color="success600" />}
              iconBg="success100"
            >
              <Button
                variant="secondary"
                onClick={() => navigate(`/plugins/${PLUGIN_ID}/categories`)}
              >
                Gestionar
              </Button>
            </ActionCard>
          </Box>

          <Box height="100%">
            <ActionCard
              title="Configuración"
              description="Datos de contacto, envíos y redes"
              icon={<Cog width={32} height={32} color="warning600" />}
              iconBg="warning100"
            >
              <Button
                variant="secondary"
                onClick={() => navigate(`/plugins/${PLUGIN_ID}/config`)}
              >
                Editar
              </Button>
            </ActionCard>
          </Box>
        </CustomGrid>
      </SectionCard>

      {loading ? (
        <Flex justifyContent="center" padding={8}>
          <Loader>Cargando estadísticas...</Loader>
        </Flex>
      ) : (
        <>
          {/* Resumen de Ventas */}
          <SectionCard title="💰 Resumen de Ventas">
            <CustomGrid $cols={4}>
              <Box height="100%">
                <StatCard
                  title="Ventas Totales"
                  value={formatCurrency(stats?.totalSales ?? 0)}
                  variant="success"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Ventas del Mes"
                  value={formatCurrency(stats?.monthlySales ?? 0)}
                  variant="primary"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Órdenes Pagadas"
                  value={stats?.paidOrders ?? 0}
                  variant="secondary"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Órdenes del Mes"
                  value={stats?.monthlyOrders ?? 0}
                  variant="alternative"
                />
              </Box>
            </CustomGrid>
          </SectionCard>

          {/* Resumen de Productos */}
          <SectionCard title="📊 Resumen de Productos">
            <CustomGrid $cols={4}>
              <Box height="100%">
                <StatCard
                  title="Total Productos"
                  value={stats?.products ?? 0}
                  variant="primary"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Categorías"
                  value={stats?.categories ?? 0}
                  variant="success"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Stock Bajo"
                  value={stats?.lowStock ?? 0}
                  variant="warning"
                />
              </Box>
              <Box height="100%">
                <StatCard
                  title="Sin Stock"
                  value={stats?.noStock ?? 0}
                  variant="danger"
                />
              </Box>
            </CustomGrid>
          </SectionCard>
        </>
      )}
    </Box>
  );
};

