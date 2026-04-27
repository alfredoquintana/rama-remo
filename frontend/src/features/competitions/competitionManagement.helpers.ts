import { competitionRegistrationStatusLabels } from '../../app/labels';
import type {
  CompetitionRegistrationMemberPayload,
  CompetitionRegistrationStatus,
  CompetitionTest,
} from '../../types/competitions';
import { formatDate } from '../../utils/dateTime';

export type NavigationState = {
  message?: string;
};

export type TestModalMode = 'create' | 'edit' | null;

export type RegistrationMemberDraft = {
  idDeportista: string;
  orden: string;
  esTimonel: boolean;
  rolTexto: string;
  observacion: string;
};

export type RegistrationDraft = {
  estado: CompetitionRegistrationStatus;
  idBote: string;
  integrantes: RegistrationMemberDraft[];
};

export const TESTS_PAGE_SIZE = 8;

export function formatCompetitionWindow(
  fechaInicio: string,
  fechaFin: string,
) {
  const start = formatDate(fechaInicio);
  const end = formatDate(fechaFin);
  return start && end ? `${start} - ${end}` : start || end || 'Sin fechas';
}

export function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((first, second) => first - second);
}

export function normalizeSearchValue(
  value: string | number | null | undefined,
) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function formatRegistrationLabel(test: CompetitionTest) {
  if (!test.inscripcion) {
    return 'Sin inscripcion';
  }

  return `Inscripcion ${competitionRegistrationStatusLabels[
    test.inscripcion.estado
  ].toLowerCase()}`;
}

export function matchesCompetitionCategory(
  athleteCategoryId: number | null | undefined,
  athleteCategoryName: string | null | undefined,
  testCategoryId: number | null | undefined,
  testCategoryName: string | null | undefined,
) {
  if (testCategoryId != null) {
    return athleteCategoryId === testCategoryId;
  }

  const normalizedTestCategory = normalizeSearchValue(testCategoryName);

  if (!normalizedTestCategory) {
    return true;
  }

  return normalizeSearchValue(athleteCategoryName) === normalizedTestCategory;
}

export function buildTestSearchText(test: CompetitionTest) {
  const memberCount = test.inscripcion?.integrantes.length ?? 0;
  const values = [
    test.numeroPrueba,
    test.ordenPrueba,
    test.nombrePrueba,
    test.categoria?.nombre,
    test.categoriaOrigen,
    test.generoOrigen,
    test.modalidadOrigen,
    test.tipoBoteOrigen,
    test.tipoBoteNormalizado?.codigo,
    test.tipoBoteNormalizado?.nombre,
    test.distancia,
    test.fecha,
    test.hora,
    test.requiereBote ? 'requiere bote' : 'sin bote',
    test.requiereTimonel ? 'requiere timonel' : 'sin timonel',
    test.esMaster ? 'master' : 'general',
    test.observacion,
    test.inscripcion?.estado,
    formatRegistrationLabel(test),
    test.inscripcion?.bote?.nombre,
    memberCount,
    `${memberCount} integrantes`,
  ];

  return normalizeSearchValue(values.filter(Boolean).join(' '));
}

export function createRegistrationDraftFromTest(
  test: CompetitionTest,
): RegistrationDraft {
  return {
    estado: test.inscripcion?.estado ?? 'presuntiva',
    idBote: test.inscripcion?.bote ? String(test.inscripcion.bote.idBote) : '',
    integrantes:
      test.inscripcion?.integrantes.map((member) => ({
        idDeportista: String(member.idDeportista),
        orden: String(member.orden),
        esTimonel: member.esTimonel,
        rolTexto: member.rolTexto ?? '',
        observacion: member.observacion ?? '',
      })) ?? [],
  };
}

export function buildRegistrationPayload(draft: RegistrationDraft) {
  const integrantes: CompetitionRegistrationMemberPayload[] =
    draft.integrantes.map((member) => ({
      idDeportista: Number(member.idDeportista),
      orden: Number(member.orden),
      esTimonel: member.esTimonel,
      rolTexto: member.rolTexto.trim() || undefined,
      observacion: member.observacion.trim() || undefined,
    }));

  return {
    estado: draft.estado,
    idBote: draft.idBote ? Number(draft.idBote) : undefined,
    integrantes,
  };
}
