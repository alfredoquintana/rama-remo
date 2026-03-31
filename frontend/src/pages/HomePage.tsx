import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings } from '../services/meetings';
import { getUsers } from '../services/users';

export function HomePage() {
  const [stats, setStats] = useState({
    users: 0,
    meetings: 0,
    meetingsWithMinutes: 0,
  });

  useEffect(() => {
    let active = true;

    Promise.all([getUsers(), getMeetings()])
      .then(([users, meetings]) => {
        if (!active) {
          return;
        }

        setStats({
          users: users.length,
          meetings: meetings.length,
          meetingsWithMinutes: meetings.filter((meeting) => meeting.hasActa).length,
        });
      })
      .catch(() => {
        if (active) {
          setStats({
            users: 0,
            meetings: 0,
            meetingsWithMinutes: 0,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section">
      <div className="hero-card">
        <span className="hero-card__badge">MVP operativo</span>
        <h2>Gestion administrativa para la rama de remo</h2>
        <p>
          Base funcional para manejar usuarios, roles, reuniones de directiva y
          actas asociadas.
        </p>
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
            resumen u oficial.
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
      </div>
    </section>
  );
}
