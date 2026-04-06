export type ThemeId =
  | 'alemania-clasico'
  | 'alemania-grafito'
  | 'alemania-marfil';

export type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
};

export const themeOptions: ThemeOption[] = [
  {
    id: 'alemania-clasico',
    label: 'Alemania clasico',
    description: 'Contraste fuerte en negro, rojo y dorado.',
  },
  {
    id: 'alemania-grafito',
    label: 'Alemania grafito',
    description: 'Base oscura con acentos rojos y oro envejecido.',
  },
  {
    id: 'alemania-marfil',
    label: 'Alemania marfil',
    description: 'Superficie clara con rojo profundo y dorado limpio.',
  },
];

export const defaultThemeId: ThemeId = 'alemania-clasico';

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return themeOptions.some((option) => option.id === value);
}
