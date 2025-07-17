import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  building: icon('ic-building'),
  owner: icon('ic-owner'),
  client: icon('ic-client'),
  person: icon('ic-person'),
  team: icon('ic-team'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  teamExternal: icon('ic-team-external'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  calculator: icon('ic-calculator'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Inicio',
    items: [
      {
        title: 'Resumen',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v {CONFIG.appVersion}</Label>,
      },
    ]
  },
  {
    subheader: 'Gestion',
    items: [
      {
        title: 'Clientes',
        path: paths.dashboard.clients.root,
        icon: ICONS.client,
        allowedRoles: ['ADMINISTRADOR', 'COORDINADOR_DE_SERVICIOS', 'ASESOR_INMOBILIARIO', 'TI', 'ASISTENTE_OFICINA'],
        children: [
          { title: 'Lista', path: paths.dashboard.clients.root },
          { title: 'Nuevo cliente ', path: paths.dashboard.clients.create },
        ],
      },
      {
        title: 'Inmuebles',
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS', 'ASESOR_INMOBILIARIO', 'MARKETING', 'ASISTENTE_OFICINA'],
        path: paths.dashboard.properties.root,
        icon: ICONS.building,
        children: [
          { title: 'Lista', path: paths.dashboard.properties.list },
          { 
            title: 'Nuevo inmueble', 
            path: paths.dashboard.properties.create,
            allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS', 'ASESOR_INMOBILIARIO', 'MARKETING']
          },
        ],
      },
      {
        title: 'Usuarios',
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS'],
        path: paths.dashboard.users.root,
        icon: ICONS.user,
      },
      {
        title: 'Aliados',
        path: paths.dashboard.allies.root,
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS'],
        icon: ICONS.team,
      },
      {
        title: 'Asesores externos',
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS'],
        path: paths.dashboard.externalAdvisers.root,
        icon: ICONS.teamExternal,
      },
      {
        title: 'Propietarios',
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS'],
        path: paths.dashboard.owners.root,
        icon: ICONS.owner,
      },
    ],
  },
  {
    subheader: 'Admimistración',
    items: [
      {
        title: 'Admimistración interna',
        path: paths.dashboard.admin.internal,
        icon: ICONS.job,
        allowedRoles: ['ADMINISTRADOR', 'TI', 'ADMINISTRADOR_DE_EMPRESA'],
      },
      {
        title: 'Gestión de archivos',
        path: paths.dashboard.admin.fileManager,
        icon: ICONS.folder,
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS', 'ADMINISTRADOR_DE_EMPRESA'],
      },
      {
        title: 'Flujo de caja',
        path: paths.dashboard.admin.cashFlow,
        icon: ICONS.invoice,
        allowedRoles: ['ADMINISTRADOR', 'TI', 'ADMINISTRADOR_DE_EMPRESA'],
      },
      {
        title: 'Calculo de comision',
        allowedRoles: ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS'],
        path: paths.dashboard.admin.commissions,
        icon: ICONS.calculator,
      },
      {
        title: 'Soporte de sistema',
        allowedRoles: ['ADMINISTRADOR', 'TI'],
        path: paths.dashboard.admin.systemSupport,
        icon: ICONS.calendar,
      },
    ],
  },
];
