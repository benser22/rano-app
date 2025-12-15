"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useStoreConfig } from '@/lib/useStoreConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getMediaUrl } from '@/lib/api/strapi';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';
import { toast } from 'sonner';
import {
  ChevronRight,
  Loader2,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, token } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zip: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
    if (user?.username) {
      setFormData(prev => ({ ...prev, name: user.username }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const validateField = (name: string, value: string): boolean => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) error = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
        break;
      case 'name':
        if (!value) error = 'El nombre es requerido';
        else if (value.length < 2) error = 'Nombre muy corto';
        break;
      case 'phone':
        if (!value) error = 'El teléfono es requerido';
        else if (!/^\d{8,15}$/.test(value.replace(/\D/g, ''))) error = 'Teléfono inválido';
        break;
      case 'address':
        if (!value) error = 'La dirección es requerida';
        break;
      case 'city':
        if (!value) error = 'La ciudad es requerida';
        break;
      case 'zip':
        if (!value) error = 'El código postal es requerido';
        else if (!/^\d{4,5}$/.test(value)) error = 'Código postal inválido (4-5 dígitos)';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateShipping = (): boolean => {
    const requiredFields = ['email', 'name', 'phone', 'address', 'city', 'zip'];
    let isValid = true;
    let firstErrorField = '';

    // Mark all required fields as touched
    const newTouched: Record<string, boolean> = {};
    requiredFields.forEach(field => { newTouched[field] = true; });
    setTouched(prev => ({ ...prev, ...newTouched }));

    // Validate each field
    for (const field of requiredFields) {
      const valid = validateField(field, formData[field as keyof typeof formData]);
      if (!valid && !firstErrorField) {
        firstErrorField = field;
        isValid = false;
      } else if (!valid) {
        isValid = false;
      }
    }

    // Focus first error field
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      element?.focus();
      toast.error('Por favor completá todos los campos requeridos');
    }

    return isValid;
  };

  const handleContinue = () => {
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const { strapi } = await import('@/lib/api/strapi');

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const { data } = await strapi.post('/orders/checkout', {
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        email: formData.email,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zip: formData.zip,
        },
      }, config);

      if (data.init_point) {
        // Redirect to MercadoPago
        window.location.href = data.init_point;
      } else {
        toast.error('No se pudo generar el link de pago');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error?.message || 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  const { config } = useStoreConfig();
  const subtotal = getTotal();
  const shipping = subtotal >= config.freeShippingMin ? 0 : config.shippingCost;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-6">
            Agregá productos para continuar con tu compra
          </p>
          <Link href="/productos">
            <Button>Ver Productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-6">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/carrito" className="hover:text-secondary-foreground">Carrito</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Checkout</span>
          </nav>
          <h1 className="text-2xl font-bold">Finalizar Compra</h1>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">Datos de Envío</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Confirmar Pedido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-card rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Datos de Envío</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className={touched.email && errors.email ? 'text-destructive' : ''}>
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="email"
                      className={touched.email && errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className={touched.name && errors.name ? 'text-destructive' : ''}>
                      Nombre completo *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Juan Pérez"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="name"
                      className={touched.name && errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.name && errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className={touched.phone && errors.phone ? 'text-destructive' : ''}>
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="3815555555"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="tel"
                      className={touched.phone && errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className={touched.address && errors.address ? 'text-destructive' : ''}>
                      Dirección *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Av. Belgrano 1234, Piso 2, Depto B"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="street-address"
                      className={touched.address && errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.address && errors.address && (
                      <p className="text-xs text-destructive">{errors.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className={touched.city && errors.city ? 'text-destructive' : ''}>
                      Ciudad *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="San Miguel de Tucumán"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="address-level2"
                      className={touched.city && errors.city ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.city && errors.city && (
                      <p className="text-xs text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      name="province"
                      placeholder="Tucumán"
                      value={formData.province}
                      onChange={handleInputChange}
                      autoComplete="address-level1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip" className={touched.zip && errors.zip ? 'text-destructive' : ''}>
                      Código Postal *
                    </Label>
                    <Input
                      id="zip"
                      name="zip"
                      placeholder="4000"
                      value={formData.zip}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      autoComplete="postal-code"
                      className={touched.zip && errors.zip ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {touched.zip && errors.zip && (
                      <p className="text-xs text-destructive">{errors.zip}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Link href="/carrito">
                    <Button variant="outline" className="gap-2 h-12">
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </Button>
                  </Link>
                  <Button onClick={handleContinue} className="flex-1 gap-2 h-12">
                    Continuar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Confirmar Pedido</h2>
                </div>

                {/* Shipping Summary */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formData.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {formData.address}, {formData.city}
                        {formData.province && `, ${formData.province}`} - CP {formData.zip}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const imageUrl = item.image ? getMediaUrl(item.image) : '/avif/placeholder.avif';
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden shrink-0">
                          <ImgWithFallback
                            src={imageUrl || ''}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Button */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2 h-12">
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="flex-1 gap-3 h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <img src="/mp_logo.png" alt="MercadoPago" className="h-6 w-auto" />
                        Pagar
                      </>
                    )}
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      Pago Seguro
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      MercadoPago
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-card rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Resumen del Pedido</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} productos)
                  </span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? '¡Gratis!' : `$${shipping.toLocaleString('es-AR')}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Envío gratis en compras mayores a ${config.freeShippingMin.toLocaleString('es-AR')}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
