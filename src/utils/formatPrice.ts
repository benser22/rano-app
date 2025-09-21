export const formatPrice = (price: number, decimals?: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals || 0,
  }).format(price);
};