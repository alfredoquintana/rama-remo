export function normalizeRut(value: string) {
  const cleanedValue = value.replace(/[.\s]/g, '').replace(/-/g, '').toUpperCase();

  if (cleanedValue.length <= 1) {
    return cleanedValue;
  }

  const body = cleanedValue.slice(0, -1);
  const verifier = cleanedValue.slice(-1);

  return `${body}-${verifier}`;
}

export function isValidRut(value: string) {
  const normalizedValue = normalizeRut(value);

  if (!/^\d{7,8}-[\dK]$/.test(normalizedValue)) {
    return false;
  }

  const [body, verifier] = normalizedValue.split('-');

  return verifier === calculateRutVerifier(body);
}

function calculateRutVerifier(body: string) {
  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) {
    return '0';
  }

  if (remainder === 10) {
    return 'K';
  }

  return String(remainder);
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 9) {
    return `+56${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('56')) {
    return `+${digits}`;
  }

  return value.trim();
}

export function isValidPhone(value: string) {
  return /^\+56\d{9}$/.test(normalizePhone(value));
}

export function formatPhone(value: string) {
  const normalizedValue = normalizePhone(value);
  const digits = normalizedValue.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('56')) {
    const localNumber = digits.slice(2);
    return `+56 ${localNumber[0]} ${localNumber.slice(1, 5)} ${localNumber.slice(5)}`;
  }

  return normalizedValue;
}
