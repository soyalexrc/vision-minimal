import { CONFIG } from 'src/global-config';

import { BlankView } from '../../sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Inicio - ${CONFIG.appName}` };

export default function Page() {
  return <BlankView title="Pagina inicial" />;
}
