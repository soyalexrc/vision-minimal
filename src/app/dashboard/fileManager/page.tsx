import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Gestion de archivos - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Gestion de archivos" />;
}
