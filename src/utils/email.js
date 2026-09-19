/*
|--------------------------------------------------------------------------
| BUSINESS EMAIL
|--------------------------------------------------------------------------
|
| .env example:
|
| VITE_BUSINESS_EMAIL=example@gmail.com
|
*/

const configuredBusinessEmail = import.meta.env.VITE_BUSINESS_EMAIL || "";

/*
|--------------------------------------------------------------------------
| CHECK CONFIG
|--------------------------------------------------------------------------
*/

export function isEmailConfigured() {
  return Boolean(String(configuredBusinessEmail).trim().includes("@"));
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
| PAYMENT
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
   * Old populated products_id
   */

  if (Array.isArray(booking?.products_id) && booking.products_id.length) {
    const names = booking.products_id
      .map((service) => service?.name || "")
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
| OPTIONAL TEXT
|--------------------------------------------------------------------------
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
    "not specified",
    "no special request",
    "no additional message",
  ];

  if (ignoredValues.includes(text.toLowerCase())) {
    return "";
  }

  return text;
}

/*
|--------------------------------------------------------------------------
| EMAIL SUBJECT
|--------------------------------------------------------------------------
|
| Old:
|
| Explore Koh Rong Booking - Tuk Tuk - 6aa41440...
|
| New:
|
| Explore Koh Rong Booking - Tuk Tuk - 12 Sep 2026
|
*/

export function buildBookingEmailSubject(booking) {
  const details =
    booking?.description && typeof booking.description === "object"
      ? booking.description
      : {};

  const service = serviceNames(booking);

  const date = formatBookingDate(details.booking_date);

  return `Explore Koh Rong Booking - ` + `${service} - ${date}`;
}

/*
|--------------------------------------------------------------------------
| EMAIL BODY
|--------------------------------------------------------------------------
*/

export function buildBookingEmailBody(booking) {
  const details =
    booking?.description && typeof booking.description === "object"
      ? booking.description
      : {};

  const customer = customerName(booking);

  const services = serviceNames(booking);

  const date = formatBookingDate(details.booking_date);

  const time = details.booking_time || "Not specified";

  const people = Math.max(1, Number(details.people || 1));

  const payment = paymentLabel(booking?.payment_method, booking?.paid_type);

  const total = formatMoney(booking?.total_price);

  const note = cleanOptionalText(details.note);

  const additionalMessage = cleanOptionalText(details.contact_message);

  /*
   * Main information only.
   */

  const lines = [
    "Hello Explore Koh Rong 🌴",
    "",
    "I would like to confirm my booking.",
    "",
    "Booking Details",
    "",
    `• Customer: ${customer}`,
    `• Service: ${services}`,
    `• Date: ${date}`,
    `• Time: ${time}`,
    `• Guests: ${people} ${people === 1 ? "person" : "people"}`,
    `• Payment: ${payment}`,
    `• Total: ${total}`,
  ];

  /*
   * Only show note when meaningful.
   */

  if (note) {
    lines.push("", `• Special Request: ${note}`);
  }

  /*
   * Only show additional message when meaningful.
   */

  if (additionalMessage) {
    lines.push("", "Message:", additionalMessage);
  }

  lines.push("", "Please confirm my booking when available.", "", "Thank you!");

  return lines.join("\n");
}

/*
|--------------------------------------------------------------------------
| BUILD GMAIL URL
|--------------------------------------------------------------------------
*/

export function buildBookingEmailUrl(booking) {
  if (!isEmailConfigured()) {
    throw new Error("Business email is not configured.");
  }

  const subject = buildBookingEmailSubject(booking);

  const body = buildBookingEmailBody(booking);

  return (
    "https://mail.google.com/mail/?view=cm" +
    "&fs=1" +
    `&to=${encodeURIComponent(configuredBusinessEmail)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/*
|--------------------------------------------------------------------------
| OPEN EMAIL
|--------------------------------------------------------------------------
*/

export function openBookingEmail(booking) {
  const url = buildBookingEmailUrl(booking);

  window.open(url, "_blank", "noopener,noreferrer");
}
