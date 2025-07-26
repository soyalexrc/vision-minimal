
import { CONFIG } from 'src/global-config';

import { CommissionCalculationListView } from '../../../sections/commission-calculation/view/commission-calculation-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Calculo de comisiones - ${CONFIG.appName}` };

export default function Page() {
  return <CommissionCalculationListView />;
}
