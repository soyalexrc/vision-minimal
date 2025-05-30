'use client';


import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from '../../../../../routes/paths';
import { Iconify } from '../../../../../components/iconify';
import { useGetClient } from '../../../../../actions/client';
import { useParams, useRouter } from '../../../../../routes/hooks';
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
  const router = useRouter();

  console.log(id);

  const { client, clientLoading, clientError } = useGetClient(id as any)

  console.log(client);

  return (
    // <Container maxWidth={settings.themeStretch ? false : 'xl'}>
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Detalle de Cliente"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Gestion' },
          { name: 'Clientes', href: paths.dashboard.clients.list },
          { name: (client as any).name },
        ]}
        action={
          <div>
            <Button onClick={() => router.push(`/dashboard/clients/update/${id}`)} variant="contained" startIcon={<Iconify icon="pepicons-pencil:pen" />}>
              Editar cliente
            </Button>
          </div>
        }
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
        client && !clientLoading && <CreateUpdateClientForm currentClient={client as any} />
      }
    </Container>
  );
}
