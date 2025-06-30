import { CONFIG } from 'src/global-config';

import { SystemSupportView } from '../../../sections/system-support/system-support-view';

// ----------------------------------------------------------------------

export const metadata = { title: `S - ${CONFIG.appName}` };

export default function Page() {
  return <SystemSupportView />;
}
