import type { Core } from "@strapi/strapi";

// Helper function to send email via Resend API (avoids SMTP port blocking)
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const apiKey = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "noreply@22studios.xyz";

  if (!apiKey) {
    throw new Error("SMTP_PASS (Resend API Key) not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async send(ctx) {
    try {
      const { name, email, subject, message } = ctx.request.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return ctx.badRequest("Todos los campos son requeridos");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest("Email inválido");
      }

      // Get store config for recipient email
      let recipientEmail = process.env.SMTP_TO || "info@ranourban.com";
      try {
        const storeConfig = await strapi
          .documents("api::store-config.store-config")
          .findFirst();
        if (storeConfig?.contactEmail) {
          recipientEmail = storeConfig.contactEmail;
        }
      } catch (e) {
        // Use default if store config not available
      }

      const brandColor = "#dc2626";
      const logoUrl = "https://rano.22studios.xyz/webp/rano_logo.webp";
      const frontendUrl =
        process.env.FRONTEND_URL || "https://rano.22studios.xyz";

      // Send email to store
      const storeEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${brandColor} 0%, #b91c1c 100%); padding: 30px; text-align: center;">
                  <a href="${frontendUrl}" style="text-decoration: none;">
                    <img src="${logoUrl}" alt="Rano Urban" width="60" height="60" style="margin-bottom: 10px; border-radius: 8px; display: inline-block;">
                  </a>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700;">
                    <a href="${frontendUrl}" style="color: white; text-decoration: none;">Nuevo Mensaje de Contacto</a>
                  </h1>
                  <p style="margin: 5px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    <a href="${frontendUrl}" style="color: #e2e8f0; text-decoration: underline;">Ir a la Web</a>
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="background: #f9fafb; border-radius: 12px; padding: 25px; border-left: 4px solid ${brandColor};">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">De</span>
                          <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600; color: #111827;">${name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
                          <p style="margin: 5px 0 0;"><a href="mailto:${email}" style="color: ${brandColor}; text-decoration: none; font-size: 16px;">${email}</a></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Asunto</span>
                          <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600; color: #111827;">${subject}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="margin-top: 25px;">
                    <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mensaje</span>
                    <div style="margin-top: 10px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                  </div>
                  
                  <div style="margin-top: 30px; text-align: center;">
                    <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: ${brandColor}; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Responder</a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #1f2937; padding: 20px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de Rano Urban</p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

      await sendEmailViaResend(
        recipientEmail,
        `[Rano Urban] Nuevo mensaje: ${subject}`,
        storeEmailHtml,
      );

      // Send confirmation email to customer
      const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background: #000000; padding: 30px; text-align: center;">
                  <a href="${frontendUrl}" style="text-decoration: none;">
                    <img src="${logoUrl}" alt="Rano Urban" width="60" height="60" style="margin-bottom: 10px; border-radius: 8px; display: inline-block;">
                  </a>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                    <a href="${frontendUrl}" style="color: white; text-decoration: none;">Rano Urban</a>
                  </h1>
                  <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 14px;">Precio y calidad</p>
                  <p style="margin: 10px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    <a href="${frontendUrl}" style="color: #4ade80; text-decoration: underline;">Visitar Tienda</a>
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px; font-size: 22px;">¡Hola ${name}! 👋</h2>
                  
                  <p style="color: #4b5563; line-height: 1.7; margin: 0 0 25px;">
                    Gracias por contactarnos. Recibimos tu mensaje y nuestro equipo te responderá 
                    <strong>a la brevedad</strong> (generalmente dentro de las próximas 24 horas hábiles).
                  </p>
                  
                  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0;">
                    <p style="color: #6b7280; margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Tu mensaje:</p>
                    <p style="color: #111827; margin: 0 0 8px; font-weight: 600;">📌 ${subject}</p>
                    <p style="color: #4b5563; margin: 0; line-height: 1.6; white-space: pre-wrap; font-style: italic;">"${message.substring(0, 150)}${message.length > 150 ? "..." : ""}"</p>
                  </div>
                  
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
                    <p style="color: #4b5563; margin: 0; line-height: 1.7;">
                      ¡Saludos! 🙌<br>
                      <strong style="color: #111827;">Equipo Rano Urban</strong>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #000000; padding: 25px; text-align: center;">
                  <p style="color: #ffffff; margin: 0 0 5px; font-weight: 600;">Rano Urban</p>
                  <p style="color: #9ca3af; margin: 0 0 15px; font-size: 13px;">Av. Belgrano 3659, San Miguel de Tucumán</p>
                  <p style="color: #6b7280; margin: 0; font-size: 11px;">© ${new Date().getFullYear()} Rano Urban. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

      await sendEmailViaResend(
        email,
        "¡Recibimos tu mensaje! - Rano Urban",
        customerEmailHtml,
      );

      return ctx.send({
        success: true,
        message: "Mensaje enviado correctamente",
      });
    } catch (error) {
      strapi.log.error("Error sending contact email:", error);
      return ctx.internalServerError(
        "Error al enviar el mensaje. Por favor, intentá de nuevo más tarde.",
      );
    }
  },
});
