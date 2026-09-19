/*
|--------------------------------------------------------------------------
| CUSTOMER NAME
|--------------------------------------------------------------------------
*/

export function bookingCustomerName(booking) {
  const customer = booking?.customer_id;

  const firstName = customer?.firstName || "";

  const lastName = customer?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    customer?.username ||
    booking?.description?.customer_name ||
    "Customer"
  );
}

/*
|--------------------------------------------------------------------------
| CUSTOMER EMAIL
|--------------------------------------------------------------------------
|
| First try populated customer.
| Then try booking snapshot.
|
*/

export function bookingCustomerEmail(booking) {
  return String(
    booking?.customer_id?.email ||
      booking?.description?.customer_email ||
      booking?.customer_email ||
      "",
  ).trim();
}

/*
|--------------------------------------------------------------------------
| CUSTOMER PHONE
|--------------------------------------------------------------------------
|
| First try populated customer.
| Then try booking snapshot.
|
*/

export function bookingCustomerPhone(booking) {
  return String(
    booking?.customer_id?.phone ||
      booking?.description?.customer_phone ||
      booking?.customer_phone ||
      "",
  ).trim();
}

/*
|--------------------------------------------------------------------------
| BOOKING CHANNEL
|--------------------------------------------------------------------------
*/

export function bookingChannel(booking) {
  return String(booking?.description?.booking_channel || "")
    .trim()
    .toUpperCase();
}

/*
|--------------------------------------------------------------------------
| SERVICE NAMES
|--------------------------------------------------------------------------
*/

export function bookingServiceNames(booking) {
  /*
   * Populated products_id.
   */

  const productNames = Array.isArray(booking?.products_id)
    ? booking.products_id
        .map((product) => (typeof product === "object" ? product?.name : ""))
        .filter(Boolean)
    : [];

  if (productNames.length) {
    return productNames.join(", ");
  }

  /*
   * Booking snapshots.
   */

  const snapshotNames = Array.isArray(booking?.products)
    ? booking.products.map((product) => product?.name || "").filter(Boolean)
    : [];

  if (snapshotNames.length) {
    return snapshotNames.join(", ");
  }

  return "Service";
}

/*
|--------------------------------------------------------------------------
| BOOKING DATE
|--------------------------------------------------------------------------
*/

export function bookingDateLabel(booking) {
  const value = booking?.description?.booking_date;

  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return String(value);
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "UTC",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| BOOKING TIME
|--------------------------------------------------------------------------
*/

export function bookingTimeLabel(booking) {
  const value = booking?.description?.booking_time;

  if (!value) {
    return "-";
  }

  const [hour, minute] = String(value).split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return String(value);
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| GUESTS
|--------------------------------------------------------------------------
*/

export function bookingGuestLabel(booking) {
  const people = Math.max(1, Number(booking?.description?.people || 1));

  return `${people} ${people === 1 ? "person" : "people"}`;
}

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

export function bookingPaymentLabel(booking) {
  const method = booking?.payment_method;

  if (method === "BANK_TRANSFER") {
    return "Bank Transfer";
  }

  if (method === "PAY_AT_CHECK_IN") {
    return "Pay at Check-In";
  }

  if (booking?.paid_type === "BANK") {
    return "Bank Transfer";
  }

  if (booking?.paid_type === "CASH") {
    return "Pay at Check-In";
  }

  return "-";
}

/*
|--------------------------------------------------------------------------
| TOTAL
|--------------------------------------------------------------------------
*/

export function bookingTotalLabel(booking) {
  return Number(booking?.total_price || 0).toFixed(2);
}

/*
|--------------------------------------------------------------------------
| NORMALIZE WHATSAPP NUMBER
|--------------------------------------------------------------------------
|
| Supported examples:
|
| 0885792065
| -> 855885792065
|
| +855 88 579 2065
| -> 855885792065
|
| 8550885792065
| -> 855885792065
|
*/

export function normalizeCustomerWhatsAppNumber(value) {
  let number = String(value || "")
    .trim()
    .replace(/\D/g, "");

  if (!number) {
    return "";
  }

  /*
   * Incorrect Cambodia form:
   *
   * 8550xxxxxxxx
   */

  if (number.startsWith("8550")) {
    number = `855${number.slice(4)}`;
  }

  /*
   * Cambodian local form:
   *
   * 0xxxxxxxx
   */

  if (number.startsWith("0")) {
    number = `855${number.slice(1)}`;
  }

  return number;
}

/*
|--------------------------------------------------------------------------
| REJECTION MESSAGE
|--------------------------------------------------------------------------
*/

export function buildBookingRejectMessage(booking, reason = "") {
  const customer = bookingCustomerName(booking);

  const service = bookingServiceNames(booking);

  const date = bookingDateLabel(booking);

  const time = bookingTimeLabel(booking);

  const guests = bookingGuestLabel(booking);

  const payment = bookingPaymentLabel(booking);

  const total = bookingTotalLabel(booking);

  const cleanReason = String(reason || "").trim();

  const lines = [
    `Hello ${customer},`,
    "",
    "Thank you for your booking request with Explore Koh Rong.",
    "",
    "Unfortunately, we are unable to confirm your booking at this time.",
    "",
    "Booking Details",
    "",
    `• Service: ${service}`,
    `• Date: ${date}`,
    `• Time: ${time}`,
    `• Guests: ${guests}`,
    `• Payment: ${payment}`,
    `• Total: $${total}`,
  ];

  /*
   * Only show reason when
   * admin actually entered one.
   */

  if (cleanReason) {
    lines.push("", "Reason", "", cleanReason);
  }

  lines.push(
    "",
    "If you would like help choosing another date or service, please contact us.",
    "",
    "Thank you,",
    "Explore Koh Rong",
  );

  return lines.join("\n");
}

/*
|--------------------------------------------------------------------------
| WHATSAPP URL
|--------------------------------------------------------------------------
*/

export function buildBookingRejectWhatsAppUrl(booking, reason = "") {
  const phone = normalizeCustomerWhatsAppNumber(bookingCustomerPhone(booking));

  if (!phone) {
    return "";
  }

  const message = buildBookingRejectMessage(booking, reason);

  return `https://wa.me/${phone}` + `?text=${encodeURIComponent(message)}`;
}

/*
|--------------------------------------------------------------------------
| EMAIL SUBJECT
|--------------------------------------------------------------------------
*/

export function buildBookingRejectEmailSubject(booking) {
  const service = bookingServiceNames(booking);

  const date = bookingDateLabel(booking);

  return `Explore Koh Rong Booking Update - ${service} - ${date}`;
}

/*
|--------------------------------------------------------------------------
| EMAIL URL
|--------------------------------------------------------------------------
*/

export function buildBookingRejectEmailUrl(booking, reason = "") {
  const email = bookingCustomerEmail(booking);

  if (!email) {
    return "";
  }

  const subject = buildBookingRejectEmailSubject(booking);

  const body = buildBookingRejectMessage(booking, reason);

  return (
    "https://mail.google.com/mail/?view=cm" +
    "&fs=1" +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}
