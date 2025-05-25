'use client';


import Container from '@mui/material/Container';

import { paths } from '../../../../routes/paths';
import { useSettingsContext } from '../../../../components/settings';
import { CustomBreadcrumbs } from '../../../../components/custom-breadcrumbs';
import {
  CreateUpdateClientForm,
} from '../../../../sections/client/form/create-update-client-form';

// ----------------------------------------------------------------------

export default function Page() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Nuevo Cliente"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Gestion' },
          { name: 'Clientes', href: paths.dashboard.clients.list },
          { name: 'Nuevo cliente' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <CreateUpdateClientForm isEdit />
    </Container>
  );
}
