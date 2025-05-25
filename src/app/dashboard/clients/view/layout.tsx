import { CONFIG } from '../../../../global-config';

export const metadata = { title: `Vista cliente - ${CONFIG.appName}` };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
