export enum RoleType {
  ASESOR_INMOBILIARIO = 'Asesor Inmobiliario',
  TI = 'Tecnologías de la Información',
  ADMINISTRADOR = 'Administrador',
  COORDINADOR_DE_SERVICIOS = 'Coordinador de Servicios',
  ADMINISTRADOR_DE_EMPRESA = 'Administrador de Empresa',
  MARKETING = 'Marketing',
}

// function to apply condition to just Admin

export function isAdmin(role: string): boolean {
  return role === RoleType.ADMINISTRADOR || role === RoleType.TI;
}
