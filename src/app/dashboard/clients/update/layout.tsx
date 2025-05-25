import { CONFIG } from '../../../../global-config';

export const metadata = { title: `Editar cliente - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
