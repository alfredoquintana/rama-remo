import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { changeAthleteCategory, getAthlete } from '../services/athletes';
import { getCategories } from '../services/categories';
import type { AthleteDetail, Category } from '../types/athletes';
import { formatDate } from '../utils/dateTime';

function todayAsDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function resolveSuggestedCategoryId(
  categories: Category[],
  currentCategoryId?: number | null,
) {
  const alternativeCategory = categories.find(
    (category) => category.idCategoria !== currentCategoryId,
  );

  return String(alternativeCategory?.idCategoria ?? categories[0]?.idCategoria ?? '');
}

export function AthleteDetailPage() {
  const params = useParams();
  const athleteId = Number(params.id);
  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fechaDesde, setFechaDesde] = useState(todayAsDateInputValue());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    Promise.all([getAthlete(athleteId), getCategories()])
      .then(([athleteData, categoriesData]) => {
        const activeCategories = categoriesData.filter((category) => category.activa);
        setAthlete(athleteData);
        setCategories(activeCategories);
        setSelectedCategoryId(
          resolveSuggestedCategoryId(
            activeCategories,
            athleteData.categoriaVigente?.categoria.idCategoria,
          ),
        );
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [athleteId]);

  const openCategoryModal = () => {
    setSelectedCategoryId(
      resolveSuggestedCategoryId(
        categories,
        athlete?.categoriaVigente?.categoria.idCategoria,
      ),
    );
    setFechaDesde(todayAsDateInputValue());
    setErrorMessage('');
    setSuccessMessage('');
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsCategoryModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCategoryId) {
      setErrorMessage('Debes seleccionar una categoría.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedAthlete = await changeAthleteCategory(athleteId, {
        idCategoria: Number(selectedCategoryId),
        fechaDesde,
      });

      setAthlete(updatedAthlete);
      setSelectedCategoryId(
        resolveSuggestedCategoryId(
          categories,
          updatedAthlete.categoriaVigente?.categoria.idCategoria,
        ),
      );
      setSuccessMessage('Categoría actualizada correctamente.');
      setIsCategoryModalOpen(false);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      {successMessage ? <StatusMessage kind="success" message={successMessage} /> : null}
      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      {isLoading ? (
        <div className="panel-card">
          <p>Cargando deportista...</p>
        </div>
      ) : !athlete ? (
        <StatusMessage kind="error" message="Deportista no encontrado." />
      ) : (
        <>
          <div className="page-heading athlete-detail-heading">
            <div className="athlete-detail-heading__top">
              <div className="athlete-detail-heading__title-row">
                <h2>{athlete.usuario.nombre}</h2>

                <span className={`pill ${athlete.activo ? 'success' : 'neutral'}`}>
                  {athlete.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="athlete-detail-heading__actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={openCategoryModal}
                >
                  Cambiar categoría
                </button>
              </div>
            </div>

            <div className="athlete-detail-heading__meta">
              <label className="form-field">
                <span>RUT</span>
                <input readOnly value={athlete.usuario.rut} />
              </label>

              <label className="form-field">
                <span>Teléfono</span>
                <input readOnly value={athlete.usuario.telefono} />
              </label>

              <label className="form-field">
                <span>Fecha de nacimiento</span>
                <input readOnly value={formatDate(athlete.usuario.fechaNac)} />
              </label>

              <label className="form-field">
                <span>Categoría vigente</span>
                <input
                  readOnly
                  value={
                    athlete.categoriaVigente
                      ? `${athlete.categoriaVigente.categoria.nombre} desde ${formatDate(athlete.categoriaVigente.fechaDesde)}`
                      : 'Sin categoría vigente'
                  }
                />
              </label>

              <label className="form-field form-field--full">
                <span>Dirección</span>
                <textarea readOnly rows={2} value={athlete.usuario.direccion} />
              </label>
            </div>
          </div>

          <div className="panel-card">
            <div className="section-heading">
              <div>
                <h3>Historial de categorías</h3>
                <p className="form-help">
                  Aquí se muestra la traza completa de cambios por deportista.
                </p>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {athlete.historialCategorias.map((assignment) => (
                  <tr key={assignment.idDeportistaCategoria}>
                    <td data-label="Categoría">{assignment.categoria.nombre}</td>
                    <td data-label="Desde">{formatDate(assignment.fechaDesde)}</td>
                    <td data-label="Hasta">
                      {assignment.fechaHasta ? formatDate(assignment.fechaHasta) : '-'}
                    </td>
                    <td data-label="Estado">
                      {assignment.vigente ? 'Vigente' : 'Histórica'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isCategoryModalOpen ? (
            <div
              className="athlete-modal-backdrop"
              role="presentation"
              onClick={closeCategoryModal}
            >
              <div
                aria-modal="true"
                className="athlete-modal"
                role="dialog"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="athlete-modal__header">
                  <div>
                    <h3>Cambiar categoría</h3>
                    <p className="form-help">
                      El sistema cerrará la categoría vigente y dejará registrada la nueva.
                    </p>
                  </div>

                  <button
                    aria-label="Cerrar cambio de categoría"
                    className="app-header__account-close"
                    type="button"
                    onClick={closeCategoryModal}
                  >
                    ×
                  </button>
                </div>

                <form className="athlete-modal__form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Nueva categoría</span>
                      <select
                        value={selectedCategoryId}
                        onChange={(event) => setSelectedCategoryId(event.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.idCategoria} value={category.idCategoria}>
                            {category.nombre} ({category.edadMin}-{category.edadMax} años)
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Fecha desde</span>
                      <input
                        required
                        type="date"
                        value={fechaDesde}
                        onChange={(event) => setFechaDesde(event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      className="button button-secondary"
                      disabled={isSubmitting}
                      type="button"
                      onClick={closeCategoryModal}
                    >
                      Cancelar
                    </button>
                    <button
                      className="button button-primary"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar cambio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
