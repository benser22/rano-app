import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Grid,
  Loader,
  Field,
} from "@strapi/design-system";
import { ArrowLeft, Check } from "@strapi/icons";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useFetchClient } from "@strapi/admin/strapi-admin";
import { PLUGIN_ID } from "../pluginId";
import { useState, useEffect } from "react";

interface StoreConfig {
  storeName: string;
  whatsappNumber: string;
  contactEmail: string;
  freeShippingMin: number;
  shippingCost: number;
  hoursWeekdays: string;
  hoursSaturday: string;
  instagramUrl: string;
  facebookUrl: string;
  address: string;
}

const defaultConfig: StoreConfig = {
  storeName: "Rano Urban",
  whatsappNumber: "",
  contactEmail: "",
  freeShippingMin: 30000,
  shippingCost: 1500,
  hoursWeekdays: "",
  hoursSaturday: "",
  instagramUrl: "",
  facebookUrl: "",
  address: "",
};

export const ConfigPage = () => {
  const [config, setConfig] = useState<StoreConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const { get, put } = useFetchClient();

  // Cargar configuración
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await get(
          "/content-manager/single-types/api::store-config.store-config"
        );
        if (data) {
          setConfig({
            storeName: data.storeName || defaultConfig.storeName,
            whatsappNumber: data.whatsappNumber || "",
            contactEmail: data.contactEmail || "",
            freeShippingMin: data.freeShippingMin ?? defaultConfig.freeShippingMin,
            shippingCost: data.shippingCost ?? defaultConfig.shippingCost,
            hoursWeekdays: data.hoursWeekdays || "",
            hoursSaturday: data.hoursSaturday || "",
            instagramUrl: data.instagramUrl || "",
            facebookUrl: data.facebookUrl || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        console.error("Error loading config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [get]);

  const handleChange = (field: keyof StoreConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put("/content-manager/single-types/api::store-config.store-config", config);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box padding={8} background="neutral100">
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Flex direction="column" alignItems="flex-start" gap={1}>
          <Button
            variant="tertiary"
            startIcon={<ArrowLeft />}
            onClick={() => navigate(`/plugins/${PLUGIN_ID}`)}
          >
            Volver
          </Button>
          <Typography variant="alpha" fontWeight="bold">
            ⚙️ Configuración de la Tienda
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            Datos de contacto, envíos y redes sociales
          </Typography>
        </Flex>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          loading={saving}
          startIcon={<Check />}
        >
          Guardar Cambios
        </Button>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" padding={8}>
          <Loader>Cargando configuración...</Loader>
        </Flex>
      ) : (
        <Flex direction="column" gap={6}>
          {/* Datos Generales */}
          <Box
            padding={6}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              🏪 Datos Generales
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Nombre de la Tienda</Field.Label>
                  <TextInput
                    value={config.storeName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("storeName", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Email de Contacto</Field.Label>
                  <TextInput
                    type="email"
                    value={config.contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("contactEmail", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Número de WhatsApp</Field.Label>
                  <TextInput
                    placeholder="Ej: 3815010399"
                    value={config.whatsappNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("whatsappNumber", e.target.value)
                    }
                  />
                  <Typography variant="pi" textColor="neutral600">Sin código de país, solo el número</Typography>
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Dirección</Field.Label>
                  <Textarea
                    value={config.address}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("address", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
            </Grid.Root>
          </Box>

          {/* Envíos */}
          <Box
            padding={6}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              🚚 Configuración de Envíos
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Costo de Envío</Field.Label>
                  <NumberInput
                    value={config.shippingCost}
                    onValueChange={(value: number | undefined) =>
                      handleChange("shippingCost", value ?? 0)
                    }
                    step={100}
                  />
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Mínimo para Envío Gratis</Field.Label>
                  <NumberInput
                    value={config.freeShippingMin}
                    onValueChange={(value: number | undefined) =>
                      handleChange("freeShippingMin", value ?? 0)
                    }
                    step={1000}
                  />
                  <Typography variant="pi" textColor="neutral600">Compras mayores a este monto tienen envío gratis</Typography>
                </Field.Root>
              </Grid.Item>
            </Grid.Root>
          </Box>

          {/* Horarios */}
          <Box
            padding={6}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              🕐 Horarios de Atención
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Lunes a Viernes</Field.Label>
                  <TextInput
                    placeholder="Ej: 9:00 - 20:00"
                    value={config.hoursWeekdays}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("hoursWeekdays", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Sábados</Field.Label>
                  <TextInput
                    placeholder="Ej: 10:00 - 14:00"
                    value={config.hoursSaturday}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("hoursSaturday", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
            </Grid.Root>
          </Box>

          {/* Redes Sociales */}
          <Box
            padding={6}
            background="neutral0"
            shadow="filterShadow"
            borderRadius="8px"
            hasRadius
          >
            <Typography variant="delta" fontWeight="semiBold" marginBottom={4}>
              📱 Redes Sociales
            </Typography>
            <Grid.Root gap={4}>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Instagram</Field.Label>
                  <TextInput
                    placeholder="https://instagram.com/..."
                    value={config.instagramUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("instagramUrl", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
              <Grid.Item col={6}>
                <Field.Root>
                  <Field.Label>Facebook</Field.Label>
                  <TextInput
                    placeholder="https://facebook.com/..."
                    value={config.facebookUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("facebookUrl", e.target.value)
                    }
                  />
                </Field.Root>
              </Grid.Item>
            </Grid.Root>
          </Box>
        </Flex>
      )}
    </Box>
  );
};
