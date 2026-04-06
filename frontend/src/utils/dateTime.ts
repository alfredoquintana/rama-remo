const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY_PATTERN = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  const dateOnlyMatch = value.match(DATE_ONLY_PATTERN);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}/${month}/${year.slice(-2)}`;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return `${padTwoDigits(parsedDate.getDate())}/${padTwoDigits(parsedDate.getMonth() + 1)}/${padTwoDigits(parsedDate.getFullYear() % 100)}`;
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  const timeOnlyMatch = value.match(TIME_ONLY_PATTERN);

  if (timeOnlyMatch) {
    const [, hours, minutes] = timeOnlyMatch;
    return `${hours}:${minutes}`;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return `${padTwoDigits(parsedDate.getHours())}:${padTwoDigits(parsedDate.getMinutes())}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return `${padTwoDigits(parsedDate.getDate())}/${padTwoDigits(parsedDate.getMonth() + 1)}/${padTwoDigits(parsedDate.getFullYear() % 100)} ${padTwoDigits(parsedDate.getHours())}:${padTwoDigits(parsedDate.getMinutes())}`;
}

function padTwoDigits(value: number) {
  return String(value).padStart(2, '0');
}
