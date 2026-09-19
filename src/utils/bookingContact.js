import { BOOKING_CONTACT } from "../config/bookingContact.js";

export function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

export function getWhatsAppNumber() {
  return normalizePhone(BOOKING_CONTACT.whatsappNumber);
}

export function getBookingEmail() {
  return String(BOOKING_CONTACT.bookingEmail || "").trim();
}

export function buildBookingMessage({
  booking,
  service,
  user,
  paymentLabel,
  additionalMessage = "",
}) {
  const details =
    booking?.description && typeof booking.description === "object"
      ? booking.description
      : {};

  const customerName =
    booking?.customer_id?.username || user?.username || user?.name || "-";

  const customerEmail = booking?.customer_id?.email || user?.email || "-";

  const serviceNames =
    (booking?.products_id || [])
      .map((item) => item?.name)
      .filter(Boolean)
      .join(", ") ||
    service?.name ||
    "-";

  const total = Number(booking?.total_price || service?.price || 0).toFixed(2);

  return [
    "Hello Explore Koh Rong 🌴",
    "",
    "I would like to confirm my booking.",
    "",
    "BOOKING DETAILS",
    "------------------------------",
    `Booking ID: ${booking?._id || "-"}`,
    `Customer: ${customerName}`,
    `Customer Email: ${customerEmail}`,
    `Service: ${serviceNames}`,
    `Date: ${details.booking_date || "-"}`,
    `Time: ${details.booking_time || "-"}`,
    `People: ${details.people || "-"}`,
    `Payment: ${paymentLabel}`,
    `Total: $${total}`,
    `Status: ${booking?.status || "PENDING"}`,
    "",
    `Special Request: ${details.note || "None"}`,
    "",
    "Additional Message:",
    additionalMessage.trim() || "No additional message",
    "",
    "Please confirm my booking.",
    "",
    "Thank you!",
  ].join("\n");
}

export function buildWhatsAppUrl(message) {
  const phone = getWhatsAppNumber();

  if (!phone) {
    throw new Error("Business WhatsApp number is not configured.");
  }

  return `https://wa.me/${phone}` + `?text=${encodeURIComponent(message)}`;
}

export function buildGmailUrl({ booking, service, message }) {
  const email = getBookingEmail();

  if (!email) {
    throw new Error("Business booking email is not configured.");
  }

  const subject =
    `Explore Koh Rong Booking - ` +
    `${service?.name || "Service"} - ` +
    `${booking?._id || ""}`;

  return (
    "https://mail.google.com/mail/?" +
    "view=cm&fs=1" +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`
  );
}
