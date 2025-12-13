import { factories } from '@strapi/strapi';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

const preference = new Preference(client);

export default {
    async checkout(ctx) {
        const { items, shippingAddress, email } = ctx.request.body;

        if (!items || items.length === 0) {
            return ctx.badRequest('No items in cart');
        }

        // Validate stock and calculate total (server side trust)
        let total = 0;
        const infoItems = []; // For MP

        const orderItems = [];

        for (const item of items) {
             const product = await strapi.entityService.findOne('api::product.product', item.id);
             if (!product) {
                 return ctx.badRequest(`Product ${item.id} not found`);
             }
             if (product.stock < item.quantity) {
                 return ctx.badRequest(`Insufficient stock for ${product.name}`);
             }

             const itemTotal = Number(product.price) * item.quantity;
             total += itemTotal;

             orderItems.push({
                 product: product.id,
                 quantity: item.quantity,
                 price: product.price // snapshot price
             });

             const productAny = product as any;
             infoItems.push({
                 title: product.name,
                 unit_price: Number(product.price),
                 quantity: item.quantity,
                 currency_id: 'ARS', // Assuming ARS or use configured currency
                 picture_url: productAny.images && productAny.images.length > 0 
                    ? (productAny.images[0].url.startsWith('http') ? productAny.images[0].url : `${process.env.URL || 'http://localhost:1337'}${productAny.images[0].url}`) 
                    : ''
             });
        }

        // Create Order in Pending State
        const order = await strapi.entityService.create('api::order.order', {
            data: {
                user: ctx.state.user ? ctx.state.user.id : null, 
                items: orderItems,
                total: total,
                status: 'pending',
                shippingAddress,
                email,
                externalReference: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}` // logic temp
            }
        });

        // Update external reference with real ID if we want, or use the generated one. 
        // Better to use database ID in Ref? Or UUID.
        // Let's use the externalReference generated above.

        try {
            const result = await preference.create({
                body: {
                    items: infoItems,
                    metadata: {
                        order_id: order.id
                    },
                    external_reference: order.externalReference,
                    payer: {
                        email: email
                    },
                    back_urls: {
                        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success`,
                        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/error`,
                        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/pending`
                    },
                    auto_return: 'approved',
                }
            });

            return {
                id: result.id,
                init_point: result.init_point,
                orderId: order.id
            };

        } catch (error) {
            console.error(error);
            return ctx.internalServerError('Failed to create preference');
        }
    }
};
