'use client';


import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from '../../../../../routes/paths';
import { useAuthContext } from '../../../../../auth/hooks';
import { RoleBasedGuard } from '../../../../../auth/guard';
import { Iconify } from '../../../../../components/iconify';
import { useGetClient } from '../../../../../actions/client';
import { useParams, useRouter } from '../../../../../routes/hooks';
import { LoadingScreen } from '../../../../../components/loading-screen';
import { CustomBreadcrumbs } from '../../../../../components/custom-breadcrumbs';
import { CreateUpdateClientForm } from '../../../../../sections/client/form/create-update-client-form';

// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const router = useRouter();

  const { client, clientLoading, clientError } = useGetClient(id as any);

  if (user && user.role === 'ASESOR_INMOBILIARIO') {
    if (client && (client as any)?.adviserId) {
      if ((client as any).adviserId !== String(user.id)) {
        return <RoleBasedGuard allowedRoles={['NONE']} hasContent children={<div />} />;
      }
    }
  }

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
            <Button
              onClick={() => router.push(`/dashboard/clients/update/${id}`)}
              variant="contained"
              startIcon={<Iconify icon="pepicons-pencil:pen" />}
            >
              Editar cliente
            </Button>
          </div>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {clientLoading && <LoadingScreen />}
      {clientError && <div>Error: {clientError}</div>}
      {client && !clientLoading && <CreateUpdateClientForm currentClient={client as any} />}
    </Container>
  );
}
