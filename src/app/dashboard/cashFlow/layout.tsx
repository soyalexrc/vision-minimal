import { CONFIG } from '../../../global-config';
import { RoleBasedGuard } from '../../../auth/guard';

export const metadata = { title: `Flujo de caja - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  const allowedRoles = ['ADMINISTRADOR', 'TI', 'ADMINISTRADOR_DE_EMPRESA'];
  return <RoleBasedGuard hasContent allowedRoles={allowedRoles}>{children}</RoleBasedGuard>;
}
