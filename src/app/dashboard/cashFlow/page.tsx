import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Flujo de caja - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Flujo de caja" />;
}
