export function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeToken(token: string) {
  return token
    .split(/([-'`])/)
    .map((segment) => {
      if (segment === '-' || segment === "'" || segment === '`') {
        return segment;
      }

      const normalizedSegment = segment.toLocaleLowerCase('es-CL');

      return normalizedSegment
        ? `${normalizedSegment.charAt(0).toLocaleUpperCase('es-CL')}${normalizedSegment.slice(1)}`
        : '';
    })
    .join('');
}

export function toTitleCase(value: string) {
  return collapseWhitespace(value)
    .split(' ')
    .map((token) => normalizeToken(token))
    .join(' ');
}

export function normalizeFreeText(value: string) {
  return collapseWhitespace(value);
}

export function normalizeLabelText(value: string) {
  return toTitleCase(value);
}

export function normalizePersonName(value: string) {
  return toTitleCase(value);
}

export function normalizeCodeText(value: string) {
  return collapseWhitespace(value).toUpperCase();
}
