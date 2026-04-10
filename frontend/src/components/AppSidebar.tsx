import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

function normalizeText(value: string) {
  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .trim();
}

function createMenuKey(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeMenuName(value: string) {
  const cleanedValue = normalizeText(value)
    .replace(/planificaci\?n/i, 'Planificación')
    .replace(/menu/i, 'Menú');
  const key = createMenuKey(cleanedValue);

  if (key.includes('inicio')) {
    return 'Inicio';
  }

  if (key.includes('usuario')) {
    return 'Usuarios';
  }

  if (key.includes('reunion')) {
    return 'Reuniones';
  }

  if (key.includes('planificacion')) {
    return 'Planificación';
  }

  if (key.includes('deportista')) {
    return 'Deportistas';
  }

  if (key.includes('flota')) {
    return 'Flota';
  }

  return cleanedValue;
}

function normalizeMenuItemName(value: string) {
  const key = createMenuKey(value);

  if (key === 'gestion de flota') {
    return 'Gestión de flota';
  }

  return normalizeText(value);
}

function normalizeMenus(data: Menu[]) {
  const groupedMenus = new Map<string, Menu>();

  data.forEach((menu) => {
    const normalizedName = normalizeMenuName(menu.nombre);
    const menuKey = createMenuKey(normalizedName);
    const currentMenu = groupedMenus.get(menuKey);
    const normalizedItems = (menu.items ?? [])
      .filter((item) => !isCreateMenuRoute(item.ruta))
      .map((item) => ({
        ...item,
        nombre: normalizeMenuItemName(item.nombre),
      }));

    if (!currentMenu) {
      groupedMenus.set(menuKey, {
        idMenu: menu.idMenu,
        nombre: normalizedName,
        items: normalizedItems,
      });
      return;
    }

    const currentItemsByRoute = new Map(
      currentMenu.items.map((item) => [item.ruta, item] as const),
    );

    normalizedItems.forEach((item) => {
      if (!currentItemsByRoute.has(item.ruta)) {
        currentMenu.items.push(item);
      }
    });
  });

  return [...groupedMenus.values()];
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
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

function UsersSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M14.5 18a3.6 3.6 0 0 1 5 0" />
    </svg>
  );
}

function AthletesSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 20c1.2-3.7 4-6 7-6s5.8 2.3 7 6" />
      <circle cx="12" cy="8" r="3.5" />
      <path d="M3.5 12.5 6.2 11" />
      <path d="m17.8 11 2.7 1.5" />
    </svg>
  );
}

function MeetingsSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3.5v3" />
      <path d="M16.5 3.5v3" />
      <path d="M3.5 9.5h17" />
      <path d="M8 13h3" />
      <path d="M13.5 13h2.5" />
      <path d="M8 16.5h8" />
    </svg>
  );
}

function PlanningSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 19.5h15" />
      <path d="M7.5 16V10.5" />
      <path d="M12 16V7.5" />
      <path d="M16.5 16v-4" />
      <path d="M6.2 8.7 9.8 6l3.5 2.6 4.5-3.6" />
      <path d="m16.8 5 1-.1-.1 1" />
    </svg>
  );
}

function FleetSectionIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-nav__icon app-nav__icon--section"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 15.5h17" />
      <path d="M5 15.5c1.5 2.1 4 3.5 7 3.5s5.5-1.4 7-3.5" />
      <path d="M11.5 6.5 8 15.5" />
      <path d="M14.5 6.5 18 15.5" />
      <path d="M10.7 8.5h1.6" />
      <path d="M13.7 8.5h1.6" />
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

function resolveSectionIcon(menuName: string) {
  const normalizedName = menuName.toLowerCase();

  if (normalizedName.includes('usuario')) {
    return <UsersSectionIcon />;
  }

  if (normalizedName.includes('deportista')) {
    return <AthletesSectionIcon />;
  }

  if (normalizedName.includes('flota')) {
    return <FleetSectionIcon />;
  }

  if (normalizedName.includes('reunion')) {
    return <MeetingsSectionIcon />;
  }

  if (
    normalizedName.includes('planificacion') ||
    normalizedName.includes('planificación')
  ) {
    return <PlanningSectionIcon />;
  }

  return null;
}

function isCreateMenuRoute(route: string) {
  const normalizedRoute = route.toLowerCase();

  return (
    normalizedRoute.endsWith('/nuevo') ||
    normalizedRoute.endsWith('/nueva') ||
    normalizedRoute.endsWith('/crear')
  );
}

function isMenuItemActive(currentPathname: string, itemRoute: string) {
  const pathname = currentPathname.toLowerCase();
  const route = itemRoute.toLowerCase();

  if (isCreateMenuRoute(route)) {
    return pathname === route || pathname.startsWith(`${route}/`);
  }

  if (pathname === route) {
    return true;
  }

  if (!pathname.startsWith(`${route}/`)) {
    return false;
  }

  const nestedSegment = pathname.slice(route.length + 1).split('/')[0] ?? '';

  return !['nuevo', 'nueva', 'crear'].includes(nestedSegment);
}

export function AppSidebar({
  isMobileOpen,
  onCloseMobileNav,
}: AppSidebarProps) {
  const location = useLocation();
  const [menus, setMenus] = useState<Menu[]>(fallbackMenus);

  useEffect(() => {
    let active = true;

    getMenus()
      .then((data) => {
        if (active && data.length > 0) {
          setMenus(normalizeMenus(data));
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
          <span className="app-sidebar__mobile-title">Menú</span>
          <button
            aria-label="Cerrar menú principal"
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
                    `app-nav__menu app-nav__menu--link app-nav__menu--section ${isActive ? 'is-active' : ''}`
                  }
                  end
                  to="/"
                  onClick={onCloseMobileNav}
                >
                  <HomeIcon />
                  <span>{menu.nombre}</span>
                </NavLink>
              ) : (
                <span className="app-nav__menu app-nav__menu--section">
                  {resolveSectionIcon(menu.nombre)}
                  <span>{menu.nombre}</span>
                </span>
              )}

              {menu.items.length > 0 ? (
                <div className="app-nav__items">
                  {menu.items.map((item) => (
                    <NavLink
                      key={item.idItem}
                      className={`app-nav__item ${isMenuItemActive(location.pathname, item.ruta) ? 'is-active' : ''}`}
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
