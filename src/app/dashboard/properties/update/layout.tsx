import { CONFIG } from '../../../../global-config';

export const metadata = { title: `Editar inmueble - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
