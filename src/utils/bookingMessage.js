/*
|--------------------------------------------------------------------------
| BOOKING MESSAGE HELPERS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
|
| Example:
| 2026-09-12T00:00:00.000Z
|
| becomes:
| 12 Sep 2026
|
*/

export function formatBookingDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",

    timeZone: "Asia/Phnom_Penh",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| FORMAT MONEY
|--------------------------------------------------------------------------
*/

export function formatBookingPrice(value) {
  const number = Number(value || 0);

  return `$${number.toFixed(2)}`;
}

/*
|--------------------------------------------------------------------------
| FORMAT PAYMENT
|--------------------------------------------------------------------------
*/

export function formatPaymentMethod(value) {
  const payment = String(value || "")
    .trim()
    .toUpperCase();

  if (payment === "BANK_TRANSFER" || payment === "BANK") {
    return "Bank Transfer";
  }

  if (payment === "PAY_AT_CHECK_IN" || payment === "CASH") {
    return "Pay at Check-In";
  }

  return value || "Not specified";
}

/*
|--------------------------------------------------------------------------
| CUSTOMER NAME
|--------------------------------------------------------------------------
*/

export function getCustomerName(booking) {
  const customer = booking?.customer_id || booking?.customer || {};

  /*
   * First + last name
   */

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  /*
   * Username
   */

  if (customer.username) {
    return customer.username;
  }

  /*
   * Booking customer name fallback
   */

  if (booking?.customer_name) {
    return booking.customer_name;
  }

  return "Customer";
}

/*
|--------------------------------------------------------------------------
| SERVICE NAMES
|--------------------------------------------------------------------------
*/

export function getServiceNames(booking) {
  /*
   * New booking snapshot structure
   */

  if (Array.isArray(booking?.products) && booking.products.length) {
    return booking.products
      .map((item) => item?.name)
      .filter(Boolean)
      .join(", ");
  }

  /*
   * Old products_id structure
   */

  if (Array.isArray(booking?.products_id) && booking.products_id.length) {
    return booking.products_id
      .map((item) => {
        if (typeof item === "string") {
          return "";
        }

        return item?.name || "";
      })
      .filter(Boolean)
      .join(", ");
  }

  /*
   * Single service fallback
   */

  if (booking?.service?.name) {
    return booking.service.name;
  }

  return "Service";
}

/*
|--------------------------------------------------------------------------
| CLEAN OPTIONAL TEXT
|--------------------------------------------------------------------------
*/

function cleanOptionalText(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const ignoredValues = [
    "none",
    "no additional message",
    "no special request",
    "n/a",
    "-",
  ];

  if (ignoredValues.includes(text.toLowerCase())) {
    return "";
  }

  return text;
}

/*
|--------------------------------------------------------------------------
| BUILD CUSTOMER BOOKING MESSAGE
|--------------------------------------------------------------------------
*/

export function buildBookingMessage(booking) {
  const customerName = getCustomerName(booking);

  const serviceNames = getServiceNames(booking);

  const bookingDate = formatBookingDate(
    booking?.description?.booking_date || booking?.booking_date,
  );

  const bookingTime =
    booking?.description?.booking_time || booking?.booking_time || "";

  const people = Number(booking?.description?.people || booking?.people || 1);

  const payment = formatPaymentMethod(
    booking?.payment_method || booking?.paid_type,
  );

  const total = formatBookingPrice(booking?.total_price);

  const specialRequest = cleanOptionalText(
    booking?.description?.note || booking?.note,
  );

  const additionalMessage = cleanOptionalText(
    booking?.description?.contact_message || booking?.contact_message,
  );

  /*
   * Build message line-by-line.
   */

  const lines = [
    "Hello Explore Koh Rong 👋",
    "",
    "I would like to confirm my booking.",
    "",
    "Booking Details",
    "",
    `• Customer: ${customerName}`,
    `• Service: ${serviceNames}`,
    `• Date: ${bookingDate || "Not specified"}`,
    `• Time: ${bookingTime || "Not specified"}`,
    `• Guests: ${people} ${people === 1 ? "person" : "people"}`,
    `• Payment: ${payment}`,
    `• Total: ${total}`,
  ];

  /*
   * Add special request ONLY when customer entered one.
   */

  if (specialRequest) {
    lines.push("", `• Special Request: ${specialRequest}`);
  }

  /*
   * Add additional message ONLY when customer entered one.
   */

  if (additionalMessage) {
    lines.push("", "Message:", additionalMessage);
  }

  lines.push("", "Please confirm my booking when available.", "", "Thank you!");

  return lines.join("\n");
}

/*
|--------------------------------------------------------------------------
| WHATSAPP MESSAGE URL
|--------------------------------------------------------------------------
*/

export function buildWhatsAppBookingUrl(phone, booking) {
  const cleanPhone = String(phone || "").replace(/[^\d]/g, "");

  const message = buildBookingMessage(booking);

  return `https://wa.me/${cleanPhone}` + `?text=${encodeURIComponent(message)}`;
}

/*
|--------------------------------------------------------------------------
| EMAIL
|--------------------------------------------------------------------------
*/

export function buildBookingEmail(booking) {
  const customerName = getCustomerName(booking);

  return {
    subject: `New Booking - ${customerName}`,

    body: buildBookingMessage(booking),
  };
}
