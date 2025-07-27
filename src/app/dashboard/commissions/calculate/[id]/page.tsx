import { notFound } from 'next/navigation';

import { CONFIG } from 'src/global-config';

import { CommissionCalculationDetailView } from '../../../../../sections/commission-calculation/view/commission-calculation-detail-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Calcular comision - ${CONFIG.appName}` };

type Props = any

export default function Page({ params }: Props) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return <CommissionCalculationDetailView id={id} />;
}
