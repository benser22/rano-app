import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
      const apiKey = process.env.SMTP_PASS;
      const from = process.env.SMTP_FROM || "noreply@22studios.xyz";

      if (!apiKey) {
        strapi.log.warn(
          "SMTP_PASS (Resend API Key) not configured. Email not sent.",
        );
        return;
      }

      try {
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
          strapi.log.error(`Resend API error: ${JSON.stringify(error)}`);
          throw new Error(`Resend API error: ${JSON.stringify(error)}`);
        }

        strapi.log.info(`Email sent successfully to ${to}: ${subject}`);
      } catch (error) {
        strapi.log.error("Error sending email via Resend:", error);
        throw error;
      }
    },

    async sendWhatsAppNotification(
      phone: string,
      message: string,
    ): Promise<void> {
      // Format phone for Argentina (WhatsApp international format: 549 + area code + number)
      let cleanPhone = phone.replace(/\D/g, "");

      // Remove leading 0
      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1);
      }

      // Handle Argentina's "15" prefix for mobiles (e.g., 381 15 5...)
      // Common formats: 038115... (12), 38115... (11), 15... (doesn't have area code)
      if (cleanPhone.length === 11 && cleanPhone.substring(3, 5) === "15") {
        // Remove '15' from the middle: 381 15 5554433 -> 381 5554433
        cleanPhone = cleanPhone.substring(0, 3) + cleanPhone.substring(5);
      } else if (
        cleanPhone.length === 11 &&
        cleanPhone.substring(2, 4) === "15"
      ) {
        // Remove '15' from the middle (2-digit area code): 11 15 5554433 -> 11 5554433
        cleanPhone = cleanPhone.substring(0, 2) + cleanPhone.substring(4);
      }

      // If it has 10 digits (e.g., 3815988025), it's [area code] + [number]
      // For WhatsApp Argentina, we need 54 + 9 + area code + number
      if (cleanPhone.length === 10 && !cleanPhone.startsWith("54")) {
        cleanPhone = "549" + cleanPhone;
      } else if (
        cleanPhone.startsWith("54") &&
        !cleanPhone.startsWith("549") &&
        cleanPhone.length === 12
      ) {
        // If it starts with 54 but is missing the 9 (e.g., 54 381 5988025)
        cleanPhone = "549" + cleanPhone.substring(2);
      } else if (!cleanPhone.startsWith("54")) {
        // Generic fallback for other formats
        cleanPhone = "54" + cleanPhone;
      }

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      strapi.log.info(
        `[WhatsApp Notification Intent] To: ${cleanPhone}, Link: ${waUrl}`,
      );

      // If you want to automate this, you would use an API like Twilio:
      /*
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);

      await client.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Twilio Sandbox or registered number
        to: `whatsapp:+${cleanPhone}`
      });
      */
    },
  }),
);
