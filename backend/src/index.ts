export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    // =========================================
    // Enable Google OAuth Provider
    // =========================================
    await enableGoogleProvider(strapi);

    // =========================================
    // Set up permissions
    // =========================================
    // Helper to find role
    const findRole = async (type) => {
      const result = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type },
      });
      return result;
    };

    // Helper to update permissions
    const updatePermissions = async (role, permissions) => {
      const pluginStore = strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });

      // Get all permissions
      const allPermissions = await strapi.plugin('users-permissions').service('permission').findMany();
      
      // Filter permissions we want to enable
      const permissionsToEnable = allPermissions.filter((permission) => {
         // permissions is object like { 'api::product': ['find', 'findOne'] }
         const [apiStr, controller] = permission.action.split('.');
         // action format: api::product.product.find or plugin::users-permissions.user.me
         
         // Simplified check
         for (const [key, actions] of Object.entries(permissions)) {
            // key could be 'api::product.product' or just shorter check
            if (permission.action.startsWith(key)) {
                const actionName = permission.action.split('.').pop();
                if ((actions as string[]).includes(actionName)) {
                    return true;
                }
            }
         }
         return false;
      });

      // Assign to role
      // In v4/v5 usually we update the role with the permission IDs
      // But simpler approach via service:
      
      // Let's rely on finding standard permissions and linking them.
      // This part is complex across database versions. 
      // Safer Strategy: Just print log instructions? 
      // User requested "do it from here".
      
      // Let's try to update the role directly with permission relation.
      const currentPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
        where: { role: role.id }
      });
      
      const newPermissions = permissionsToEnable.filter(p => !currentPermissions.find(cp => cp.action === p.action));
      
      if (newPermissions.length > 0) {
          strapi.log.info(`Adding ${newPermissions.length} permissions to role ${role.type}`);
          await Promise.all(newPermissions.map(p => 
              strapi.db.query('plugin::users-permissions.permission').create({
                  data: {
                      action: p.action,
                      role: role.id
                  }
              })
          ));
      }
    };

    try {
        const publicRole = await findRole('public');
        const authRole = await findRole('authenticated');

        if (publicRole) {
            await updatePermissions(publicRole, {
                'api::product.product': ['find', 'findOne'],
                'api::category.category': ['find', 'findOne'],
                'api::order.custom-order': ['checkout'], // Custom controller
                // Standard order actions usually hidden/restricted for public
            });
        }

        if (authRole) {
            await updatePermissions(authRole, {
                'api::product.product': ['find', 'findOne'],
                'api::category.category': ['find', 'findOne'],
                'api::order.custom-order': ['checkout'],
                // 'api::order.order': ['find', 'findOne'], // Optional: user sees own orders
                'plugin::users-permissions.user': ['me']
            });
        }
        
        strapi.log.info('Permissions bootstrapped successfully');

    } catch (error) {
        strapi.log.error('Bootstrap permission error:', error);
    }
  },
};

/**
 * Enable Google OAuth provider programmatically
 */
async function enableGoogleProvider(strapi) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    strapi.log.warn('Google OAuth: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
    return;
  }

  try {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const grantSettings = await pluginStore.get({ key: 'grant' }) || {};
    
    // Check if already enabled with correct settings
    if (grantSettings.google?.enabled && 
        grantSettings.google?.key === GOOGLE_CLIENT_ID) {
      strapi.log.info('Google OAuth: Already configured');
      return;
    }

    // Update Google provider settings
    const updatedSettings = {
      ...grantSettings,
      google: {
        enabled: true,
        icon: 'google',
        key: GOOGLE_CLIENT_ID,
        secret: GOOGLE_CLIENT_SECRET,
        callback: `${FRONTEND_URL}/callback/google`,
        scope: ['email', 'profile'],
      },
    };

    await pluginStore.set({
      key: 'grant',
      value: updatedSettings,
    });

    strapi.log.info('✅ Google OAuth provider enabled successfully!');
    
  } catch (error) {
    strapi.log.error('Failed to enable Google OAuth:', error);
  }
}

