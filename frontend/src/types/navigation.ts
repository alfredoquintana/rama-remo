export type MenuItem = {
  idItem: number;
  nombre: string;
  ruta: string;
};

export type Menu = {
  idMenu: number;
  nombre: string;
  items: MenuItem[];
};
