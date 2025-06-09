'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CreateUpdatePropertyForm } from '../../../../sections/property/form/create-update-property-form';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Nuevo inmueble"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Inmuebles', href: paths.dashboard.properties.root },
          { name: 'Nuevo inmueble' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CreateUpdatePropertyForm />
    </DashboardContent>
  );
}
