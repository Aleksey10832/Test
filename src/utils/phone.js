export function digitsOnly(value) {
  return (value || '').replace(/\D/g, '');
}

export function normalizePhone(value) {
  let digits = digitsOnly(value);
  if (!digits) return '';
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  else if (digits.length === 10 && !digits.startsWith('7')) digits = `7${digits}`;
  return digits;
}

export function phoneToChatId(value) {
  const digits = normalizePhone(value);
  return digits ? `${digits}@c.us` : '';
}

export function formatPhone(value) {
  const digits = normalizePhone(value);
  if (digits.length !== 11) return value || '';
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}
