'use client';


import Container from '@mui/material/Container';

import { paths } from '../../../../routes/paths';
import { CustomBreadcrumbs } from '../../../../components/custom-breadcrumbs';
import { CreateCashflowForm } from '../../../../sections/cashflow/form/create-cashflow-form';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    // <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Nueva transacción"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Administración' },
          { name: 'Flujo de caja', href: paths.dashboard.cashFlow.list },
          { name: 'Nueva transacción' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CreateCashflowForm />
    </Container>
  );
}
