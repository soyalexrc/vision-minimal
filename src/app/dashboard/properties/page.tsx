import { CONFIG } from 'src/global-config';

import { PropertyListView } from '../../../sections/property/view/property-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Inmuebles - ${CONFIG.appName}` };

export default function Page() {
  return <PropertyListView />;
}
