import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Nuevo asesor externo - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Nuevo asesor externo" />;
}
