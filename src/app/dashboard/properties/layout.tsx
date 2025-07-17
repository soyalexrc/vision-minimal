import { CONFIG } from '../../../global-config';
import { RoleBasedGuard } from '../../../auth/guard';

export const metadata = { title: `Inmuebles - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  const allowedRoles = ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS', 'ASESOR_INMOBILIARIO', 'MARKETING', 'ASISTENTE_OFICINA'];
  return <RoleBasedGuard hasContent allowedRoles={allowedRoles}>{children}</RoleBasedGuard>;
}
