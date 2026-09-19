export function apiMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function bookingStatusSeverity(status) {
  if (status === 'ACCEPT') return 'success';
  if (status === 'REJECT') return 'danger';
  return 'warn';
}

export function activeStatusSeverity(status) {
  if (status === 'ACTIVE' || status === 'PUBLISHED' || status === 'APPROVED') return 'success';
  if (status === 'BLOCKED' || status === 'REJECTED') return 'danger';
  if (status === 'PENDING' || status === 'DRAFT') return 'warn';
  return 'secondary';
}
