/*
|--------------------------------------------------------------------------
| WHATSAPP BUSINESS NUMBER
|--------------------------------------------------------------------------
|
| .env example:
|
| VITE_WHATSAPP_BUSINESS_NUMBER=855885792065
|
| No "+" is required.
|
*/

const configuredBusinessNumber =
  import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "";

/*
|--------------------------------------------------------------------------
| NORMALIZE WHATSAPP NUMBER
|--------------------------------------------------------------------------
*/

export function normalizeWhatsAppNumber(value = configuredBusinessNumber) {
  return String(value || "").replace(/\D/g, "");
}

/*
|--------------------------------------------------------------------------
| CHECK CONFIGURATION
|--------------------------------------------------------------------------
*/

export function isWhatsAppConfigured() {
  return normalizeWhatsAppNumber().length >= 8;
}

/*
|--------------------------------------------------------------------------
| FORMAT MONEY
|--------------------------------------------------------------------------
*/

function formatMoney(value) {
  const amount = Number(value || 0);

  return `$${amount.toFixed(2)}`;
}

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
|
| Example:
|
| 2026-09-12T00:00:00.000Z
|
| becomes:
|
| 12 Sep 2026
|
*/

function formatBookingDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
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
| PAYMENT LABEL
|--------------------------------------------------------------------------
*/

function paymentLabel(method, paidType) {
  const value = String(method || paidType || "").toUpperCase();

  if (value === "BANK_TRANSFER" || value === "BANK") {
    return "Bank Transfer";
  }

  if (value === "PAY_AT_CHECK_IN" || value === "CASH") {
    return "Pay at Check-In";
  }

  return method || paidType || "Not specified";
}

/*
|--------------------------------------------------------------------------
| SERVICE NAMES
|--------------------------------------------------------------------------
|
| Supports both:
|
| booking.products
| booking.products_id
|
*/

function serviceNames(booking) {
  /*
   * New booking snapshot structure
   */

  if (Array.isArray(booking?.products) && booking.products.length) {
    const names = booking.products
      .map((item) => {
        const name = item?.name || "";

        const quantity = Number(item?.quantity || 1);

        if (!name) {
          return "";
        }

        if (quantity > 1) {
          return `${name} × ${quantity}`;
        }

        return name;
      })
      .filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  /*
   * Old populated products_id structure
   */

  if (Array.isArray(booking?.products_id) && booking.products_id.length) {
    const names = booking.products_id
      .map((service) => {
        return service?.name || "";
      })
      .filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  return "Service";
}

/*
|--------------------------------------------------------------------------
| CUSTOMER NAME
|--------------------------------------------------------------------------
*/

function customerName(booking) {
  const customer = booking?.customer_id || {};

  const firstName = customer?.firstName || "";

  const lastName = customer?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  if (customer?.username) {
    return customer.username;
  }

  return "Customer";
}

/*
|--------------------------------------------------------------------------
| CLEAN OPTIONAL TEXT
|--------------------------------------------------------------------------
|
| Do not show empty/default values in WhatsApp.
|
*/

function cleanOptionalText(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const ignoredValues = [
    "none",
    "n/a",
    "na",
    "-",
    "no special request",
    "no additional message",
    "not specified",
  ];

  if (ignoredValues.includes(text.toLowerCase())) {
    return "";
  }

  return text;
}

/*
|--------------------------------------------------------------------------
| BUILD BOOKING WHATSAPP MESSAGE
|--------------------------------------------------------------------------
|
| Customer-facing message should be short and readable.
|
| Removed:
|
| - Booking MongoDB ID
| - Customer email
| - Raw status
| - Raw payment enum
| - Raw ISO date
| - Empty notes
|
*/

export function buildBookingWhatsAppMessage(booking) {
  const details =
    booking?.description && typeof booking.description === "object"
      ? booking.description
      : {};

  const name = customerName(booking);

  const services = serviceNames(booking);

  const date = formatBookingDate(details.booking_date);

  const time = details.booking_time || "Not specified";

  const people = Math.max(1, Number(details.people || 1));

  const payment = paymentLabel(booking?.payment_method, booking?.paid_type);

  const total = formatMoney(booking?.total_price);

  const note = cleanOptionalText(details.note);

  const additionalMessage = cleanOptionalText(details.contact_message);

  /*
   * Main message
   */

  const lines = [
    "Hello Explore Koh Rong 🌴",
    "",
    "I would like to confirm my booking.",
    "",
    "Booking Details",
    "",
    `• Customer: ${name}`,
    `• Service: ${services}`,
    `• Date: ${date}`,
    `• Time: ${time}`,
    `• Guests: ${people} ${people === 1 ? "person" : "people"}`,
    `• Payment: ${payment}`,
    `• Total: ${total}`,
  ];

  /*
   * Only include special request
   * when the customer entered one.
   */

  if (note) {
    lines.push("", `• Special Request: ${note}`);
  }

  /*
   * Only include additional message
   * when the customer entered one.
   */

  if (additionalMessage) {
    lines.push("", "Message:", additionalMessage);
  }

  /*
   * Closing
   */

  lines.push("", "Please confirm my booking when available.", "", "Thank you!");

  return lines.join("\n");
}

/*
|--------------------------------------------------------------------------
| BUILD WHATSAPP URL
|--------------------------------------------------------------------------
*/

export function buildBookingWhatsAppUrl(booking) {
  const businessNumber = normalizeWhatsAppNumber();

  if (!businessNumber) {
    throw new Error("Business WhatsApp number is not configured.");
  }

  const message = buildBookingWhatsAppMessage(booking);

  return (
    `https://wa.me/${businessNumber}` + `?text=${encodeURIComponent(message)}`
  );
}

/*
|--------------------------------------------------------------------------
| OPEN WHATSAPP
|--------------------------------------------------------------------------
*/

export function openBookingWhatsApp(booking) {
  const url = buildBookingWhatsAppUrl(booking);

  window.open(url, "_blank", "noopener,noreferrer");
}
