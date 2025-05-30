
import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Calculo de comisiones - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Calculo de comisiones" />;
}
