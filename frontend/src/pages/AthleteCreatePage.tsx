import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusMessage } from '../components/StatusMessage';
import { createAthlete, searchAthleteUsers } from '../services/athletes';
import { getCategories } from '../services/categories';
import type { AthleteUserSearchResult, Category } from '../types/athletes';
import { formatDate } from '../utils/dateTime';

function todayAsDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AthleteCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<AthleteUserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<AthleteUserSearchResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fechaDesde, setFechaDesde] = useState(todayAsDateInputValue());
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getCategories()
      .then((data) => {
        const activeCategories = data.filter((category) => category.activa);
        setCategories(activeCategories);
        setSelectedCategoryId(String(activeCategories[0]?.idCategoria ?? ''));
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setIsLoadingCategories(false);
      });
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);
    setErrorMessage('');

    try {
      const data = await searchAthleteUsers(searchTerm);
      setResults(data);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      setErrorMessage('Debes seleccionar un usuario existente.');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMessage('Debes seleccionar una categoría.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const athlete = await createAthlete({
        idUsuario: selectedUser.idUsuario,
        idCategoria: Number(selectedCategoryId),
        fechaDesde,
      });

      navigate('/deportistas', {
        state: {
          message: `Deportista registrado correctamente en categoría ${athlete.categoriaVigente?.categoria.nombre ?? ''}.`,
        },
      });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Registrar deportista</h2>
          <p>Busca una persona ya registrada y crea su ficha deportiva sin duplicar datos.</p>
        </div>
      </div>

      {errorMessage ? <StatusMessage kind="error" message={errorMessage} /> : null}

      <form className="form-card" onSubmit={handleSearch}>
        <div className="section-heading">
          <div>
            <h3>Buscar usuario existente</h3>
            <p className="form-help">
              Puedes buscar por nombre o RUT. El usuario no debe estar registrado ya como
              deportista.
            </p>
          </div>
        </div>

        <div className="selection-row">
          <label className="form-field">
            <span>Búsqueda</span>
            <input
              placeholder="Ejemplo: Sofía o 21.000.000"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <button className="button button-primary" disabled={isSearching} type="submit">
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="search-results">
          {results.map((user) => (
            <button
              key={user.idUsuario}
              className="search-result"
              type="button"
              onClick={() => setSelectedUser(user)}
            >
              <strong>{user.nombre}</strong>
              <span>
                {user.rut} · Nacimiento {formatDate(user.fechaNac)}
              </span>
              <span>
                {user.yaEsDeportista
                  ? 'Ya registrado como deportista.'
                  : user.accesoHabilitado
                    ? 'Con acceso habilitado.'
                    : 'Sin acceso al sistema.'}
              </span>
            </button>
          ))}
        </div>
      </form>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <h3>Asignación inicial</h3>
            <p className="form-help">
              Se creará la ficha deportiva y su primera categoría vigente.
            </p>
          </div>
        </div>

        {selectedUser ? (
          <div className="participant-chip">
            <div>
              <strong>{selectedUser.nombre}</strong>
              <span>
                {selectedUser.rut} · {selectedUser.telefono}
              </span>
            </div>
            {selectedUser.yaEsDeportista && selectedUser.idDeportista ? (
              <Link
                className="button button-secondary button-small"
                to={`/deportistas/${selectedUser.idDeportista}`}
              >
                Ver ficha existente
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="form-help">Todavía no has seleccionado a una persona.</p>
        )}

        <div className="form-grid">
          <label className="form-field">
            <span>Categoría inicial</span>
            <select
              disabled={isLoadingCategories}
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
          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Registrando...' : 'Registrar deportista'}
          </button>
        </div>
      </form>
    </section>
  );
}
