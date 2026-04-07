import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getMenus } from '../services/menus';
import type { Menu } from '../types/navigation';

type AppSidebarProps = {
  isMobileOpen: boolean;
  onCloseMobileNav: () => void;
};

const fallbackMenus: Menu[] = [
  {
    idMenu: 0,
    nombre: 'Inicio',
    items: [],
  },
];

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-sidebar__close-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function AppSidebar({
  isMobileOpen,
  onCloseMobileNav,
}: AppSidebarProps) {
  const [menus, setMenus] = useState<Menu[]>(fallbackMenus);

  useEffect(() => {
    let active = true;

    getMenus()
      .then((data) => {
        if (active && data.length > 0) {
          setMenus(data);
        }
      })
      .catch(() => {
        if (active) {
          setMenus(fallbackMenus);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={!isMobileOpen}
        className={`app-sidebar__backdrop ${isMobileOpen ? 'is-open' : ''}`}
        onClick={onCloseMobileNav}
      />

      <aside
        className={`app-sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`}
        id="app-primary-navigation"
      >
        <div className="app-sidebar__mobile-header">
          <span className="app-sidebar__mobile-title">Menu</span>
          <button
            aria-label="Cerrar menu principal"
            className="app-sidebar__close-button"
            type="button"
            onClick={onCloseMobileNav}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="app-nav" aria-label="Principal">
          {menus.map((menu) => (
            <div key={menu.idMenu} className="app-nav__group">
              {menu.nombre === 'Inicio' ? (
                <NavLink
                  className={({ isActive }) =>
                    `app-nav__menu app-nav__menu--link ${isActive ? 'is-active' : ''}`
                  }
                  end
                  to="/"
                  onClick={onCloseMobileNav}
                >
                  <HomeIcon />
                  <span>{menu.nombre}</span>
                </NavLink>
              ) : (
                <span className="app-nav__menu">{menu.nombre}</span>
              )}

              {menu.items.length > 0 ? (
                <div className="app-nav__items">
                  {menu.items.map((item) => (
                    <NavLink
                      key={item.idItem}
                      className={({ isActive }) =>
                        `app-nav__item ${isActive ? 'is-active' : ''}`
                      }
                      to={item.ruta}
                      onClick={onCloseMobileNav}
                    >
                      {item.nombre}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
