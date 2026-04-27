import type {
  BoatDetail,
  BoatPayload,
  FleetCatalogsResponse,
} from '../../types/fleet';

export const PAGE_SIZE = 10;

export type FleetFilterForm = {
  search: string;
  idTipoBote: string;
  idEstadoBote: string;
  activo: string;
};

export type BoatFormValues = {
  idTipoBote: string;
  idEstadoBote: string;
  nombre: string;
  marca: string;
  anio: string;
  observacion: string;
  activo: boolean;
};

export type FleetModalMode = 'create' | 'edit' | 'detail' | null;

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

export function createEmptyBoatForm(
  catalogs: FleetCatalogsResponse | null,
): BoatFormValues {
  return {
    idTipoBote: String(catalogs?.tiposBote[0]?.idTipoBote ?? ''),
    idEstadoBote: String(catalogs?.estadosBote[0]?.idEstadoBote ?? ''),
    nombre: '',
    marca: '',
    anio: '',
    observacion: '',
    activo: true,
  };
}

export function createBoatFormFromDetail(boat: BoatDetail): BoatFormValues {
  return {
    idTipoBote: String(boat.tipoBote.idTipoBote),
    idEstadoBote: String(boat.estadoBote.idEstadoBote),
    nombre: boat.nombre,
    marca: boat.marca ?? '',
    anio: boat.anio ? String(boat.anio) : '',
    observacion: boat.observacion ?? '',
    activo: boat.activo,
  };
}

export function buildBoatPayload(values: BoatFormValues): BoatPayload {
  return {
    idTipoBote: Number(values.idTipoBote),
    idEstadoBote: Number(values.idEstadoBote),
    nombre: values.nombre.trim(),
    marca: values.marca.trim() || undefined,
    anio: values.anio.trim() ? Number(values.anio) : undefined,
    observacion: values.observacion.trim() || undefined,
    activo: values.activo,
  };
}

export function describeActiveFilter(value: string) {
  if (value === 'true') {
    return 'Solo activos';
  }

  if (value === 'false') {
    return 'Solo inactivos';
  }

  return 'Todos';
}

export function areFiltersEqual(
  first: FleetFilterForm,
  second: FleetFilterForm,
) {
  return (
    first.search === second.search &&
    first.idTipoBote === second.idTipoBote &&
    first.idEstadoBote === second.idEstadoBote &&
    first.activo === second.activo
  );
}

export function describeAppliedFilters(
  filters: FleetFilterForm,
  catalogs: FleetCatalogsResponse | null,
) {
  const descriptions: string[] = [];

  if (filters.idTipoBote) {
    const selectedType = catalogs?.tiposBote.find(
      (tipoBote) => String(tipoBote.idTipoBote) === filters.idTipoBote,
    );

    if (selectedType) {
      descriptions.push(`Tipo: ${selectedType.codigo} - ${selectedType.nombre}`);
    }
  }

  if (filters.idEstadoBote) {
    const selectedState = catalogs?.estadosBote.find(
      (estadoBote) => String(estadoBote.idEstadoBote) === filters.idEstadoBote,
    );

    if (selectedState) {
      descriptions.push(`Estado: ${selectedState.nombre}`);
    }
  }

  if (filters.activo) {
    descriptions.push(describeActiveFilter(filters.activo));
  }

  return descriptions.join(' Â· ');
}
