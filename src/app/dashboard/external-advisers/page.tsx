import { CONFIG } from 'src/global-config';

import { ExternalAdviserListView } from '../../../sections/external-adviser/view/external-adviser-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Asesores externos - ${CONFIG.appName}` };

export default function Page() {
  return <ExternalAdviserListView />;
}
