// ── WhatsApp Payment Config ───────────────────────────────────────────────────
// Update ADMIN_WHATSAPP_NUMBER if the admin number changes.
// Format: international with country code, no spaces or dashes.

export const ADMIN_WHATSAPP_NUMBER = "+916305964802";

/**
 * Builds a WhatsApp deep-link URL with a prefilled message.
 * @param {string} phone  - E.164 format (e.g. '+916305964802')
 * @param {string} message - Plain-text message body
 */
export const buildWhatsAppUrl = (phone, message) => {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

/**
 * Builds the detailed registration payment message with all attendee details.
 * @param {{ eventName: string, userName: string, email: string, mobile: string, passes: number, role: string, building: string, lookingFor: string, amount: number }} opts
 */
export const buildRegistrationMessage = ({
  eventName,
  userName,
  email,
  mobile,
  passes,
  amount,
}) => {
  const lines = [
    `🎟️ *EBC Meetup Registration - Payment Confirmation*`,
    ``,
    `*Event:* ${eventName}`,
    ``,
    `*── Attendee Details ──*`,
    `*Name:* ${userName}`,
    `*Email:* ${email || "Not provided"}`,
    `*Mobile:* ${mobile || "Not provided"}`,
    `*Passes:* ${passes}`,
    `*Amount Paid:* ₹${amount}`,
    ``,
    `I have completed the UPI payment. Please find my payment screenshot above.`,
    ``,
    `Kindly approve my registration. Thank you! 🙏`,
  ];
  return lines.join("\n");
};
