import type {
  CompetitionCatalogsResponse,
  CompetitionDetail,
  CompetitionStatus,
  CompetitionTest,
  CompetitionTestPayload,
  CompetitionType,
  CreateCompetitionPayload,
} from '../../types/competitions';

export type CompetitionFormState = {
  nombre: string;
  tipoCompetencia: CompetitionType;
  organizador: string;
  sede: string;
  fechaInicio: string;
  fechaFin: string;
  estado: CompetitionStatus;
  observacion: string;
};

export type CompetitionTestFormState = {
  numeroPrueba: string;
  ordenPrueba: string;
  nombrePrueba: string;
  idCategoria: string;
  generoOrigen: string;
  modalidadOrigen: string;
  tipoBoteOrigen: string;
  idTipoBote: string;
  distancia: string;
  fecha: string;
  hora: string;
  requiereBote: boolean;
  cantidadTripulantesEsperada: string;
  requiereTimonel: boolean;
  esMaster: boolean;
  observacion: string;
};

type CompetitionDateWindow = Pick<CompetitionDetail, 'fechaInicio' | 'fechaFin'>;

export function todayAsDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function createEmptyCompetitionForm(
  catalogs: CompetitionCatalogsResponse | null,
): CompetitionFormState {
  return {
    nombre: '',
    tipoCompetencia: catalogs?.tiposCompetencia[0] ?? 'regata',
    organizador: '',
    sede: '',
    fechaInicio: todayAsDateInputValue(),
    fechaFin: todayAsDateInputValue(),
    estado: catalogs?.estadosCompetencia[0] ?? 'borrador',
    observacion: '',
  };
}

export function createCompetitionFormFromDetail(
  competition: CompetitionDetail,
): CompetitionFormState {
  return {
    nombre: competition.nombre,
    tipoCompetencia: competition.tipoCompetencia,
    organizador: competition.organizador ?? '',
    sede: competition.sede ?? '',
    fechaInicio: competition.fechaInicio,
    fechaFin: competition.fechaFin,
    estado: competition.estado,
    observacion: competition.observacion ?? '',
  };
}

export function buildCompetitionPayload(
  form: CompetitionFormState,
): CreateCompetitionPayload {
  return {
    nombre: form.nombre.trim(),
    tipoCompetencia: form.tipoCompetencia,
    organizador: form.organizador.trim() || undefined,
    sede: form.sede.trim() || undefined,
    fechaInicio: form.fechaInicio,
    fechaFin: form.fechaFin,
    estado: form.estado,
    observacion: form.observacion.trim() || undefined,
  };
}

export function createEmptyTestForm(): CompetitionTestFormState {
  return createEmptyTestFormForCompetition();
}

export function createEmptyTestFormForCompetition(
  competition?: CompetitionDateWindow | null,
): CompetitionTestFormState {
  return {
    numeroPrueba: '',
    ordenPrueba: '',
    nombrePrueba: '',
    idCategoria: '',
    generoOrigen: '',
    modalidadOrigen: '',
    tipoBoteOrigen: '',
    idTipoBote: '',
    distancia: '',
    fecha: competition?.fechaInicio ?? '',
    hora: '',
    requiereBote: true,
    cantidadTripulantesEsperada: '',
    requiereTimonel: false,
    esMaster: false,
    observacion: '',
  };
}

export function createTestFormFromTest(
  test: CompetitionTest,
): CompetitionTestFormState {
  return {
    numeroPrueba: String(test.numeroPrueba),
    ordenPrueba: String(test.ordenPrueba),
    nombrePrueba: test.nombrePrueba,
    idCategoria: test.categoria ? String(test.categoria.idCategoria) : '',
    generoOrigen: test.generoOrigen ?? '',
    modalidadOrigen: test.modalidadOrigen ?? '',
    tipoBoteOrigen: test.tipoBoteOrigen ?? '',
    idTipoBote: test.tipoBoteNormalizado
      ? String(test.tipoBoteNormalizado.idTipoBote)
      : '',
    distancia: test.distancia ? String(test.distancia) : '',
    fecha: test.fecha ?? '',
    hora: test.hora ?? '',
    requiereBote: test.requiereBote,
    cantidadTripulantesEsperada: test.cantidadTripulantesEsperada
      ? String(test.cantidadTripulantesEsperada)
      : '',
    requiereTimonel: test.requiereTimonel,
    esMaster: test.esMaster,
    observacion: test.observacion ?? '',
  };
}

export function buildTestPayload(
  form: CompetitionTestFormState,
): CompetitionTestPayload {
  return {
    numeroPrueba: Number(form.numeroPrueba),
    ordenPrueba: Number(form.ordenPrueba),
    nombrePrueba: form.nombrePrueba.trim(),
    idCategoria: form.idCategoria ? Number(form.idCategoria) : undefined,
    generoOrigen: form.generoOrigen.trim() || undefined,
    modalidadOrigen: form.modalidadOrigen.trim() || undefined,
    tipoBoteOrigen: form.tipoBoteOrigen.trim() || undefined,
    idTipoBote: form.idTipoBote ? Number(form.idTipoBote) : undefined,
    distancia: form.distancia ? Number(form.distancia) : undefined,
    fecha: form.fecha || undefined,
    hora: form.hora || undefined,
    requiereBote: form.requiereBote,
    cantidadTripulantesEsperada: form.cantidadTripulantesEsperada
      ? Number(form.cantidadTripulantesEsperada)
      : undefined,
    requiereTimonel: form.requiereTimonel,
    esMaster: form.esMaster,
    observacion: form.observacion.trim() || undefined,
  };
}
