export type CategorySeedDefinition = {
  nombre: string;
  edadMin: number;
  edadMax: number;
  orden: number;
  activa: boolean;
};

export type ClubAthleteSeed = {
  rut: string;
  nombre: string;
  telefono: string;
  fechaNac: string;
  direccion: string;
  categoryName: string;
};

export const CATEGORY_SEED_DEFINITIONS: CategorySeedDefinition[] = [
  {
    nombre: 'Infantil',
    edadMin: 10,
    edadMax: 11,
    orden: 1,
    activa: true,
  },
  {
    nombre: 'Cadete',
    edadMin: 12,
    edadMax: 13,
    orden: 2,
    activa: true,
  },
  {
    nombre: 'Juvenil',
    edadMin: 14,
    edadMax: 15,
    orden: 3,
    activa: true,
  },
  {
    nombre: 'Junior',
    edadMin: 16,
    edadMax: 18,
    orden: 4,
    activa: true,
  },
  {
    nombre: 'Master',
    edadMin: 27,
    edadMax: 65,
    orden: 5,
    activa: true,
  },
];

const FIRST_NAMES = [
  'Sofía',
  'Martín',
  'Josefa',
  'Benjamín',
  'Antonia',
  'Vicente',
  'Isidora',
  'Tomás',
  'Emilia',
  'Matías',
  'Florencia',
  'Nicolás',
  'Amanda',
  'Joaquín',
  'Catalina',
  'Lucas',
  'Renata',
  'Gaspar',
  'Ángela',
  'Simón',
  'Valentina',
  'Máximo',
  'Trinidad',
  'Agustín',
  'Micaela',
  'Ignacio',
  'Daniela',
  'Alonso',
  'María José',
  'Felipe',
];

const LAST_NAMES = [
  'Muñoz',
  'Peña',
  'Núñez',
  'Maldonado',
  'Sanhueza',
  'Bórquez',
  'Leal',
  'Oyarzún',
  'Cárdenas',
  'Sepúlveda',
  'Mella',
  'Jara',
  'Acuña',
  'Cofré',
  'Mansilla',
  'Navarrete',
  'Bustos',
  'Reyes',
  'Lagos',
  'Pino',
  'Bañados',
  'Fuenzalida',
  'Ñanco',
  'Mora',
  'Carrasco',
  'Alarcón',
  'Valenzuela',
  'Riquelme',
  'Vergara',
  'Cid',
];

const STREETS = [
  'Avenida Costanera',
  'General Lagos',
  'Aníbal Pinto',
  'Bueras',
  'Yerbas Buenas',
  'Los Laureles',
  'Picarte',
  'Arauco',
  'Ramón Picarte',
  'Yungay',
  'Carlos Anwandter',
  'Caupolicán',
];

const YOUTH_AGES = [
  10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12,
  12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14,
  15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17,
  17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18,
];

const MASTER_AGES = [
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
  46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
];

export function buildClubAthleteSeedUsers(): ClubAthleteSeed[] {
  const ages = [...YOUTH_AGES, ...MASTER_AGES];

  return ages.map((age, index) => ({
    rut: buildRut(21000000 + index),
    nombre: buildFullName(index),
    telefono: `+5697${String(1000000 + index).padStart(7, '0')}`,
    fechaNac: buildBirthDate(age, index),
    direccion: buildAddress(index),
    categoryName: resolveCategoryName(age),
  }));
}

function buildFullName(index: number) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const firstLastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const secondLastName = LAST_NAMES[(index * 5 + 7) % LAST_NAMES.length];

  return `${firstName} ${firstLastName} ${secondLastName}`;
}

function buildAddress(index: number) {
  const street = STREETS[index % STREETS.length];
  const number = 120 + index * 7;

  return `${street} ${number}, Valdivia`;
}

function buildBirthDate(age: number, index: number) {
  const year = 2026 - age;
  const month = String((index % 3) + 1).padStart(2, '0');
  const day = String((index % 20) + 5).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function resolveCategoryName(age: number) {
  if (age >= 27) {
    return 'Master';
  }

  if (age <= 11) {
    return 'Infantil';
  }

  if (age <= 13) {
    return 'Cadete';
  }

  if (age <= 15) {
    return 'Juvenil';
  }

  return 'Junior';
}

function buildRut(baseNumber: number) {
  const verifier = calculateRutVerifier(baseNumber);

  return `${baseNumber}-${verifier}`;
}

function calculateRutVerifier(value: number) {
  const digits = String(value)
    .split('')
    .reverse()
    .map((digit) => Number(digit));

  let factor = 2;
  let total = 0;

  for (const digit of digits) {
    total += digit * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const remainder = 11 - (total % 11);

  if (remainder === 11) {
    return '0';
  }

  if (remainder === 10) {
    return 'K';
  }

  return String(remainder);
}
