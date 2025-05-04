import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Aliados - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Aliados" />;
}
