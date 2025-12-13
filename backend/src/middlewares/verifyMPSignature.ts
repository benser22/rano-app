import crypto from 'crypto';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    // If specifically in dev mode and we want to skip sig check for testing:
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_MP_SIG === 'true') {
        return next();
    }

    const signature = ctx.request.headers['x-signature'];
    const requestId = ctx.request.headers['x-request-id'];

    if (!signature) {
       // Only enforce if we have a secret set
       if (!process.env.MP_WEBHOOK_SECRET) return next();
       return ctx.unauthorized('Missing signature');
    }

    const parts = (Array.isArray(signature) ? signature[0] : signature).split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !hash) {
        return ctx.unauthorized('Invalid signature format');
    }

    const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET || '')
      .update(manifest)
      .digest('hex');

    if (hmac !== hash) {
      return ctx.unauthorized('Invalid signature');
    }

    await next();
  };
};
