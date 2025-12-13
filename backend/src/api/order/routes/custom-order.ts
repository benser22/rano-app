export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/checkout',
      handler: 'custom-order.checkout',
      config: {
        auth: false, // Or true if requiring login
      }
    }
  ]
};
