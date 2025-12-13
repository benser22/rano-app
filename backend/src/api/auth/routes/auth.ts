/**
 * Custom auth routes
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/google/callback',
      handler: 'auth.googleCallback',
      config: {
        auth: false, // This route is public
        policies: [],
        middlewares: [],
      },
    },
  ],
};
