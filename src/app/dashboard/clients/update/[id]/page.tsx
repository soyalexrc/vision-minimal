'use client';


import Container from '@mui/material/Container';

import { paths } from '../../../../../routes/paths';
import { useParams } from '../../../../../routes/hooks';
import { useGetClient } from '../../../../../actions/client';
import { useSettingsContext } from '../../../../../components/settings';
import { LoadingScreen } from '../../../../../components/loading-screen';
import { CustomBreadcrumbs } from '../../../../../components/custom-breadcrumbs';
import {
  CreateUpdateClientForm,
} from '../../../../../sections/client/form/create-update-client-form';

// ----------------------------------------------------------------------

export default function Page() {
  const settings = useSettingsContext();
  const { id } = useParams();

  const { client, clientLoading, clientError } = useGetClient(id as any)

  return (
    // <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edicion de Cliente"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Gestion' },
          { name: 'Clientes', href: paths.dashboard.clients.list },
          { name: (client as any).name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {
        clientLoading && <LoadingScreen />
      }
      {
        clientError && <div>Error: {clientError}</div>
      }
      {
        client && !clientLoading && <CreateUpdateClientForm currentClient={client as any} isEdit />
      }
    </Container>
  );
}
