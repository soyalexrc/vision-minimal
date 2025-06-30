import { CONFIG } from '../../../global-config';
import { RoleBasedGuard } from '../../../auth/guard';

export const metadata = { title: `Gestion de archivos - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  const allowedRoles = ['ADMINISTRADOR', 'TI'];
  return <RoleBasedGuard hasContent allowedRoles={allowedRoles}>{children}</RoleBasedGuard>;
}
