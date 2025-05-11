import { CONFIG } from 'src/global-config';

import { AllyListView } from '../../../sections/ally/view/allies-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Aliados - ${CONFIG.appName}` };

export default function Page() {
  return <AllyListView />;
}
