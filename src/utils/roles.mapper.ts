export enum RoleType {
  ASESOR_INMOBILIARIO = 'Asesor Inmobiliario',
  TI = 'Tecnologías de la Información',
  ADMINISTRADOR = 'Administrador',
  COORDINADOR_DE_SERVICIOS = 'Coordinador de Servicios',
  ADMINISTRADOR_DE_EMPRESA = 'Administrador de Empresa',
  MARKETING = 'Marketing',
  ASISTENTE_OFICINA = 'Asistente de Oficina',
}

// function to apply condition to just Admin

export function isAdmin(role: string): boolean {
  return role === RoleType.ADMINISTRADOR || role === RoleType.TI;
}

export function canEditProperties(role: string): boolean {
  return isAdmin(role) || role === RoleType.MARKETING;
}

export function canManagePropertyStatus(role: string): boolean {
  return isAdmin(role) || role === RoleType.MARKETING;
}

export function canCreateClients(role: string): boolean {
  return isAdmin(role) || role === RoleType.ASISTENTE_OFICINA;
}

export function canViewPropertiesOnly(role: string): boolean {
  return role === RoleType.ASISTENTE_OFICINA;
}
