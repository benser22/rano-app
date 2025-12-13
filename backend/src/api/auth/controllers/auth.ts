/**
 * Custom auth controller for handling Google OAuth callback
 */

export default {
  /**
   * Process Google OAuth tokens and return a Strapi JWT
   * 
   * This endpoint receives the raw Google tokens (id_token, access_token)
   * and exchanges them for a Strapi JWT by creating/finding the user.
   */
  async googleCallback(ctx) {
    const { id_token, access_token } = ctx.request.body;

    if (!id_token && !access_token) {
      return ctx.badRequest('Missing tokens');
    }

    try {
      // Decode the id_token to get user info (it's a JWT)
      // In production, you should verify the signature with Google's public keys
      const tokenParts = id_token.split('.');
      if (tokenParts.length !== 3) {
        return ctx.badRequest('Invalid id_token format');
      }

      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString('utf8')
      );

      const { email, name, given_name, family_name, picture, sub: googleId } = payload;

      if (!email) {
        return ctx.badRequest('Email not found in token');
      }

      // Find or create user
      const userService = strapi.plugin('users-permissions').service('user');
      const jwt = strapi.plugin('users-permissions').service('jwt');

      // Try to find existing user by email
      let user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Get the authenticated role
        const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });

        // Create new user
        user = await strapi.db.query('plugin::users-permissions.user').create({
          data: {
            username: name || email.split('@')[0],
            email: email.toLowerCase(),
            provider: 'google',
            confirmed: true,
            blocked: false,
            role: authenticatedRole.id,
          },
        });

        strapi.log.info(`Created new user via Google OAuth: ${email}`);
      }

      // Generate Strapi JWT
      const token = jwt.issue({ id: user.id });

      // Return user and token
      ctx.body = {
        jwt: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          provider: user.provider || 'google',
          confirmed: user.confirmed,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      strapi.log.error('Google OAuth error:', error);
      return ctx.badRequest('Failed to process Google authentication');
    }
  },
};
