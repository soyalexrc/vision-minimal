import { CONFIG } from 'src/global-config';

import { ComingSoonView } from '../../sections/common/coming-soon';

// ----------------------------------------------------------------------

export const metadata = { title: `Inicio - ${CONFIG.appName}` };

export default function Page() {
  return <ComingSoonView />;
}
