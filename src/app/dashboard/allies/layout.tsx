import { CONFIG } from '../../../global-config';
import { RoleBasedGuard } from '../../../auth/guard';

export const metadata = { title: `Aliados - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  const allowedRoles = ['ADMINISTRADOR', 'TI', 'COORDINADOR_DE_SERVICIOS']
  return <RoleBasedGuard hasContent allowedRoles={allowedRoles}>{children}</RoleBasedGuard>;
}
