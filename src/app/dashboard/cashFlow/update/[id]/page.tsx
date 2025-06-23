'use client';


import Container from '@mui/material/Container';

import { paths } from '../../../../../routes/paths';
import { useParams } from '../../../../../routes/hooks';
import { useGetCashFlow } from '../../../../../actions/cashflow';
import { formatNumericId } from '../../../../../utils/format-string';
import { LoadingScreen } from '../../../../../components/loading-screen';
import { CustomBreadcrumbs } from '../../../../../components/custom-breadcrumbs';
import { UpdateCashFlowForm } from '../../../../../sections/cashflow/form/update-cashflow-form';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();
  const { cashflow, cashflowLoading, cashflowError } = useGetCashFlow(id as any)

  console.log('cashflow', cashflow)


  return (
    // <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edicion de Registro"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Administracion' },
          { name: 'Flujo de caja', href: paths.dashboard.cashFlow.list },
          { name: `#${formatNumericId(id as any, 5)}` },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {
        cashflowLoading && <LoadingScreen />
      }
      {
        cashflowError && <div>Error: {cashflowError}</div>
      }
      <p>hello</p>
      {
        cashflow && !cashflowLoading && <UpdateCashFlowForm currentCashFlow={cashflow as any} />
      }
    </Container>
  );
}
