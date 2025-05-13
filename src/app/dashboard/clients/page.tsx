import { CONFIG } from 'src/global-config';

import { ClientListView } from '../../../sections/client/view/client-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Clientes - ${CONFIG.appName}` };

export default function Page() {
  return <ClientListView/>
}
