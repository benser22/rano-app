import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  Textarea,
  NumberInput,
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
import { SectionCard, RowContainer } from "../ui";

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
  tiktokUrl: string;
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
  tiktokUrl: "",
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
        const response = await get(
          "/content-manager/single-types/api::store-config.store-config"
        );
        // La respuesta tiene estructura: { data: { ...campos... }, meta: {...} }
        const configData = response.data?.data || response.data;
        if (configData) {
          setConfig({
            storeName: configData.storeName || defaultConfig.storeName,
            whatsappNumber: configData.whatsappNumber || "",
            contactEmail: configData.contactEmail || "",
            freeShippingMin: configData.freeShippingMin ?? defaultConfig.freeShippingMin,
            shippingCost: configData.shippingCost ?? defaultConfig.shippingCost,
            hoursWeekdays: configData.hoursWeekdays || "",
            hoursSaturday: configData.hoursSaturday || "",
            instagramUrl: configData.instagramUrl || "",
            facebookUrl: configData.facebookUrl || "",
            tiktokUrl: configData.tiktokUrl || "",
            address: configData.address || "",
          });
        }
      } catch (error) {
        console.error("Error loading config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          size="L"
        >
          Guardar Cambios
        </Button>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" padding={8}>
          <Loader>Cargando configuración...</Loader>
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {/* FILA 1: Datos Generales + Envíos */}
          <RowContainer>
            <SectionCard title="🏪 Datos Generales">
              <Flex wrap="wrap" gap={4}>
                <Box style={{ flex: '1 1 200px', minWidth: '180px' }}>
                  <Field.Root>
                    <Field.Label>Nombre de la Tienda</Field.Label>
                    <TextInput
                      value={config.storeName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("storeName", e.target.value)
                      }
                    />
                  </Field.Root>
                </Box>
                <Box style={{ flex: '1 1 200px', minWidth: '180px' }}>
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
                </Box>
                <Box style={{ flex: '1 1 200px', minWidth: '180px' }}>
                  <Field.Root>
                    <Field.Label>WhatsApp</Field.Label>
                    <TextInput
                      placeholder="Ej: 3815010399"
                      value={config.whatsappNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("whatsappNumber", e.target.value)
                      }
                    />
                  </Field.Root>
                </Box>
                <Box style={{ flex: '1 1 200px', minWidth: '180px' }}>
                  <Field.Root>
                    <Field.Label>Dirección</Field.Label>
                    <TextInput
                      value={config.address}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("address", e.target.value)
                      }
                    />
                  </Field.Root>
                </Box>
              </Flex>
            </SectionCard>

            <SectionCard title="🚚 Configuración de Envíos">
              <Flex direction="column" gap={4}>
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
                <Field.Root>
                  <Field.Label>Mínimo Envío Gratis</Field.Label>
                  <NumberInput
                    value={config.freeShippingMin}
                    onValueChange={(value: number | undefined) =>
                      handleChange("freeShippingMin", value ?? 0)
                    }
                    step={1000}
                  />
                  <Typography variant="pi" textColor="neutral600">
                    Compras mayores tienen envío gratis
                  </Typography>
                </Field.Root>
              </Flex>
            </SectionCard>
          </RowContainer>

          {/* FILA 2: Horarios + Redes Sociales */}
          <RowContainer>
            <SectionCard title="🕐 Horarios de Atención" style={{ flex: 2 }}>
              <Flex wrap="wrap" gap={4}>
                <Box style={{ flex: '1 1 180px', minWidth: '160px' }}>
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
                </Box>
                <Box style={{ flex: '1 1 180px', minWidth: '160px' }}>
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
                </Box>
              </Flex>
            </SectionCard>

            <SectionCard title="📱 Redes Sociales" style={{ flex: 3 }}>
              <Flex wrap="wrap" gap={4}>
                <Box style={{ flex: '1 1 180px', minWidth: '160px' }}>
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
                </Box>
                <Box style={{ flex: '1 1 180px', minWidth: '160px' }}>
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
                </Box>
                <Box style={{ flex: '1 1 180px', minWidth: '160px' }}>
                  <Field.Root>
                    <Field.Label>TikTok</Field.Label>
                    <TextInput
                      placeholder="https://tiktok.com/@..."
                      value={config.tiktokUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("tiktokUrl", e.target.value)
                      }
                    />
                  </Field.Root>
                </Box>
              </Flex>
            </SectionCard>
          </RowContainer>
        </Flex>
      )}
    </Box>
  );
};
