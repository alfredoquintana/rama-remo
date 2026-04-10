import type { Dispatch, SetStateAction } from 'react';
import { DatePickerField } from '../DatePickerField';
import { TimePickerField } from '../TimePickerField';
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
type CompetitionTestFormMode = 'create' | 'edit';

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

export function CompetitionFormFields({
  form,
  catalogs,
  onChange,
}: {
  form: CompetitionFormState;
  catalogs: CompetitionCatalogsResponse | null;
  onChange: Dispatch<SetStateAction<CompetitionFormState>>;
}) {
  const setField = <K extends keyof CompetitionFormState>(
    key: K,
    value: CompetitionFormState[K],
  ) => onChange((current) => ({ ...current, [key]: value }));

  return (
    <div className="form-grid">
      <label className="form-field">
        <span>Nombre</span>
        <input
          required
          value={form.nombre}
          onChange={(event) => setField('nombre', event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Tipo competencia</span>
        <select
          value={form.tipoCompetencia}
          onChange={(event) =>
            setField('tipoCompetencia', event.target.value as CompetitionType)
          }
        >
          {catalogs?.tiposCompetencia.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Organizador</span>
        <input
          value={form.organizador}
          onChange={(event) => setField('organizador', event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Sede</span>
        <input
          value={form.sede}
          onChange={(event) => setField('sede', event.target.value)}
        />
      </label>

      <DatePickerField
        label="Fecha inicio"
        required
        value={form.fechaInicio}
        onChange={(value) => setField('fechaInicio', value)}
      />

      <DatePickerField
        label="Fecha fin"
        required
        value={form.fechaFin}
        onChange={(value) => setField('fechaFin', value)}
      />

      <label className="form-field">
        <span>Estado</span>
        <select
          value={form.estado}
          onChange={(event) =>
            setField('estado', event.target.value as CompetitionStatus)
          }
        >
          {catalogs?.estadosCompetencia.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field form-field--full">
        <span>Observacion</span>
        <textarea
          rows={3}
          value={form.observacion}
          onChange={(event) => setField('observacion', event.target.value)}
        />
      </label>
    </div>
  );
}

export function CompetitionTestFormFields({
  form,
  catalogs,
  competitionType,
  competitionStartDate,
  competitionEndDate,
  mode,
  onChange,
}: {
  form: CompetitionTestFormState;
  catalogs: CompetitionCatalogsResponse | null;
  competitionType: CompetitionType;
  competitionStartDate: string;
  competitionEndDate: string;
  mode: CompetitionTestFormMode;
  onChange: Dispatch<SetStateAction<CompetitionTestFormState>>;
}) {
  const setField = <K extends keyof CompetitionTestFormState>(
    key: K,
    value: CompetitionTestFormState[K],
  ) => onChange((current) => ({ ...current, [key]: value }));

  const selectedBoatType =
    catalogs?.tiposBote.find((item) => String(item.idTipoBote) === form.idTipoBote) ?? null;
  const hasSingleCompetitionDay = competitionStartDate === competitionEndDate;
  const isDateLocked = hasSingleCompetitionDay && form.fecha !== '';
  const isErgometer = competitionType === 'ergometro';
  const isCrewDerivedFromBoatType = !isErgometer && !!selectedBoatType;

  const handleNumeroPruebaChange = (nextValue: string) => {
    onChange((current) => {
      const shouldSyncOrder =
        current.ordenPrueba === '' || current.ordenPrueba === current.numeroPrueba;

      return {
        ...current,
        numeroPrueba: nextValue,
        ordenPrueba: shouldSyncOrder ? nextValue : current.ordenPrueba,
      };
    });
  };

  const handleBoatTypeChange = (nextValue: string) => {
    const boatType = catalogs?.tiposBote.find((item) => String(item.idTipoBote) === nextValue) ?? null;
    const derivedCrewCount = boatType ? deriveCrewCountFromBoatType(boatType) : '';

    onChange((current) => ({
      ...current,
      idTipoBote: nextValue,
      tipoBoteOrigen: boatType?.codigo ?? '',
      requiereBote: isErgometer ? false : boatType ? true : current.requiereBote,
      cantidadTripulantesEsperada:
        boatType && derivedCrewCount ? derivedCrewCount : current.cantidadTripulantesEsperada,
      requiereTimonel: boatType ? !!boatType.requiereTimonel : current.requiereTimonel,
    }));
  };

  return (
    <div className="form-grid">
      <label className="form-field">
        <span>Numero prueba</span>
        <input
          min="1"
          required
          type="number"
          value={form.numeroPrueba}
          onChange={(event) => handleNumeroPruebaChange(event.target.value)}
        />
        <small className="form-help">
          Identificador visible de la prueba. Si no cambias el orden, ambos quedan iguales.
        </small>
      </label>

      <label className="form-field">
        <span>Orden prueba</span>
        <input
          min="1"
          required
          type="number"
          value={form.ordenPrueba}
          onChange={(event) => setField('ordenPrueba', event.target.value)}
        />
        <small className="form-help">
          Define la posicion en la grilla y en el programa, aunque el numero oficial sea otro.
        </small>
      </label>

      <label className="form-field form-field--full">
        <span>Nombre prueba</span>
        <input
          required
          value={form.nombrePrueba}
          onChange={(event) => setField('nombrePrueba', event.target.value)}
        />
      </label>

      <label className="form-field">
        <span>Categoria</span>
        <select
          value={form.idCategoria}
          onChange={(event) => setField('idCategoria', event.target.value)}
        >
          <option value="">Seleccionar categoria</option>
          {catalogs?.categorias.map((item) => (
            <option key={item.idCategoria} value={item.idCategoria}>
              {item.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Genero</span>
        <select
          value={form.generoOrigen}
          onChange={(event) => setField('generoOrigen', event.target.value)}
        >
          <option value="">Seleccionar genero</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Mixto">Mixto</option>
        </select>
      </label>

      <label className="form-field">
        <span>Modalidad origen</span>
        <select
          className="competition-form__select"
          value={form.modalidadOrigen}
          onChange={(event) => setField('modalidadOrigen', event.target.value)}
        >
          <option value="">Seleccionar modalidad</option>
          {catalogs?.modalidadesPrueba.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Tipo de bote</span>
        <select
          disabled={isErgometer}
          value={form.idTipoBote}
          onChange={(event) => handleBoatTypeChange(event.target.value)}
        >
          <option value="">Seleccionar tipo de bote</option>
          {catalogs?.tiposBote.map((item) => (
            <option key={item.idTipoBote} value={item.idTipoBote}>
              {item.codigo} - {item.nombre}
            </option>
          ))}
        </select>

      </label>

      <label className="form-field">
        <span>Distancia</span>
        <select
          value={form.distancia}
          onChange={(event) => setField('distancia', event.target.value)}
        >
          <option value="">Seleccionar distancia</option>
          {catalogs?.distanciasPrueba.map((item) => (
            <option key={item} value={item}>
              {item} m
            </option>
          ))}
        </select>
      </label>

      <DatePickerField
        label="Fecha prueba"
        disabled={isDateLocked}
        min={competitionStartDate}
        max={competitionEndDate}
        value={form.fecha}
        onChange={(value) => setField('fecha', value)}
      />

      <TimePickerField
        label="Hora prueba"
        value={form.hora}
        onChange={(value) => setField('hora', value)}
      />

      <label className="form-field">
        <span>Tripulantes esperados</span>
        <input
          disabled={isCrewDerivedFromBoatType}
          min="1"
          type="number"
          value={form.cantidadTripulantesEsperada}
          onChange={(event) =>
            setField('cantidadTripulantesEsperada', event.target.value)
          }
        />
        {isCrewDerivedFromBoatType ? (
          <small className="form-help">
            Se completa automaticamente segun el tipo de bote seleccionado.
          </small>
        ) : null}
      </label>

      <div className="competition-test-toggle-grid form-field--full">
        <label className="competition-toggle">
          <input
            checked={form.requiereBote && !isErgometer}
            disabled={isErgometer || isCrewDerivedFromBoatType}
            type="checkbox"
            onChange={(event) => setField('requiereBote', event.target.checked)}
          />
          <span className="competition-toggle__slider" aria-hidden="true" />
          <span className="competition-toggle__copy">
            <strong>Requiere bote</strong>
            <small>{isErgometer ? 'Se desactiva para ergometro.' : 'Activa la asignacion de bote.'}</small>
          </span>
        </label>

        <label className="competition-toggle">
          <input
            checked={form.requiereTimonel}
            disabled={isCrewDerivedFromBoatType}
            type="checkbox"
            onChange={(event) => setField('requiereTimonel', event.target.checked)}
          />
          <span className="competition-toggle__slider" aria-hidden="true" />
          <span className="competition-toggle__copy">
            <strong>Requiere timonel</strong>
            <small>
              {isCrewDerivedFromBoatType
                ? 'Se define automaticamente desde el tipo de bote.'
                : 'Marca si la tripulacion necesita timonel.'}
            </small>
          </span>
        </label>

        <label className="competition-toggle">
          <input
            checked={form.esMaster}
            type="checkbox"
            onChange={(event) => setField('esMaster', event.target.checked)}
          />
          <span className="competition-toggle__slider" aria-hidden="true" />
          <span className="competition-toggle__copy">
            <strong>Es master</strong>
            <small>Activa el calculo de categorias master en la inscripcion.</small>
          </span>
        </label>
      </div>

      {mode === 'create' && isDateLocked ? (
        <p className="form-help form-field--full">
          La fecha queda fijada automaticamente porque la competencia dura un solo dia.
        </p>
      ) : null}

      <label className="form-field form-field--full">
        <span>Observacion</span>
        <textarea
          rows={3}
          value={form.observacion}
          onChange={(event) => setField('observacion', event.target.value)}
        />
      </label>
    </div>
  );
}

function deriveCrewCountFromBoatType(boatType: { codigo: string; requiereTimonel?: boolean }) {
  const match = boatType.codigo.match(/^(\d+)/);

  if (!match) {
    return '';
  }

  const baseCrew = Number(match[1]);
  return String(boatType.requiereTimonel ? baseCrew + 1 : baseCrew);
}
