import { CONFIG } from '../../../../global-config';

export const metadata = { title: `Editar Registro - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
