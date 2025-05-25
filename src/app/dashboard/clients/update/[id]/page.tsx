'use client';


import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from '../../../../../routes/paths';
import { useParams } from '../../../../../routes/hooks';
import { Iconify } from '../../../../../components/iconify';
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

  console.log(id);

  const { client, clientLoading, clientError } = useGetClient(id as any)

  console.log(client);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Edicion de Cliente"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Gestion' },
          { name: 'Clientes', href: paths.dashboard.clients.list },
          { name: client.name },
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
