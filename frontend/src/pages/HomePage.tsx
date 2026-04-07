import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings } from '../services/meetings';
import { getAnnualPlans } from '../services/planning';
import { getUsers } from '../services/users';

export function HomePage() {
  const [stats, setStats] = useState({
    users: 0,
    meetings: 0,
    meetingsWithMinutes: 0,
    annualPlans: 0,
  });

  useEffect(() => {
    let active = true;

    Promise.all([getUsers(), getMeetings(), getAnnualPlans()])
      .then(([users, meetings, annualPlans]) => {
        if (!active) {
          return;
        }

        setStats({
          users: users.length,
          meetings: meetings.length,
          meetingsWithMinutes: meetings.filter((meeting) => meeting.hasActa).length,
          annualPlans: annualPlans.length,
        });
      })
      .catch(() => {
        if (active) {
          setStats({
            users: 0,
            meetings: 0,
            meetingsWithMinutes: 0,
            annualPlans: 0,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h2>Panel general</h2>
          <p>
            Revisa rapidamente el estado del MVP y entra a los flujos principales desde
            aqui.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Usuarios</span>
          <strong>{stats.users}</strong>
        </article>
        <article className="stat-card">
          <span>Reuniones</span>
          <strong>{stats.meetings}</strong>
        </article>
        <article className="stat-card">
          <span>Reuniones con acta</span>
          <strong>{stats.meetingsWithMinutes}</strong>
        </article>
        <article className="stat-card">
          <span>Planes anuales</span>
          <strong>{stats.annualPlans}</strong>
        </article>
      </div>

      <div className="content-grid">
        <article className="panel-card">
          <h3>Usuarios y roles</h3>
          <p>
            Registra integrantes, mantiene sus datos personales y asigna uno o
            mas roles por usuario.
          </p>
          <div className="inline-actions">
            <Link className="button button-primary" to="/usuarios">
              Ver usuarios
            </Link>
            <Link className="button button-secondary" to="/usuarios/nuevo">
              Crear usuario
            </Link>
          </div>
        </article>

        <article className="panel-card">
          <h3>Reuniones y actas</h3>
          <p>
            Planifica reuniones, define participantes y registra el acta como
            respaldo del directorio.
          </p>
          <div className="inline-actions">
            <Link className="button button-primary" to="/reuniones">
              Ver reuniones
            </Link>
            <Link className="button button-secondary" to="/reuniones/nueva">
              Crear reunion
            </Link>
          </div>
        </article>

        <article className="panel-card">
          <h3>Planificacion anual</h3>
          <p>
            Ordena compromisos del ano, registra seguimiento y muestra avances de forma
            simple para la directiva.
          </p>
          <div className="inline-actions">
            <Link className="button button-primary" to="/planificacion">
              Ver planificacion
            </Link>
            <Link className="button button-secondary" to="/planificacion/nuevo">
              Crear plan anual
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
