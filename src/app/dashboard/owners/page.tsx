import { CONFIG } from 'src/global-config';

import { OwnerListView } from '../../../sections/owner/view/owner-list-view';


// ----------------------------------------------------------------------

export const metadata = { title: `Propietarios - ${CONFIG.appName}` };

export default function Page() {
  return <OwnerListView />;
}
