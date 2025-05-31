'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useParams } from '../../../../../routes/hooks';
import { useGetProperty } from '../../../../../actions/property';
import { LoadingScreen } from '../../../../../components/loading-screen';
import { CreateUpdatePropertyForm } from '../../../../../sections/property/form/create-update-property-form';

import type { IPropertyItemCreateUpdate } from '../../../../../types/property';


// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  const { property, propertyLoading, propertyError } = useGetProperty(id as string)


  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar inmueble"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Inmuebles', href: paths.dashboard.properties.root },
          { name: (property as any)?.slug },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />


      {
        propertyLoading && <LoadingScreen />
      }
      {
        propertyError && <div>Error: {propertyError}</div>
      }
      {
        property && (property as any).id && !propertyLoading && <CreateUpdatePropertyForm currentProperty={property as IPropertyItemCreateUpdate} />
      }
    </DashboardContent>
  );
}
