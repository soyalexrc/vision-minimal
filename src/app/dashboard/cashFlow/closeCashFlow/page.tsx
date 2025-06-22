import { CONFIG } from 'src/global-config';

import CloseCashFlowView from '../../../../sections/cashflow/view/close-cashflow-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Cierre de Flujo de caja - ${CONFIG.appName}` };

export default function Page() {
  return <CloseCashFlowView />;
}
