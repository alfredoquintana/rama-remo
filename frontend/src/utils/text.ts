export function toTitleCaseLabel(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) {
        return '';
      }

      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(' ');
}

export function formatRoleList(values: Array<{ nombre: string }>) {
  return values.map((value) => toTitleCaseLabel(value.nombre)).join(', ');
}
