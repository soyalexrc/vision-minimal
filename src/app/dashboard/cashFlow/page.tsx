import { CONFIG } from 'src/global-config';

import { CashFlowListView } from '../../../sections/cashflow/view/cashflow-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Flujo de caja - ${CONFIG.appName}` };

export default function Page() {
  return <CashFlowListView />;
}
