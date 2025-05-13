import { CONFIG } from 'src/global-config';

import { UserListView } from '../../../sections/user/view/user-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Usuarios - ${CONFIG.appName}` };

export default function Page() {
  return <UserListView />;
}
