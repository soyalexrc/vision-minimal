'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useParams } from '../../../../../routes/hooks';
import { useGetPropertyDetail } from '../../../../../actions/property';
import { LoadingScreen } from '../../../../../components/loading-screen';
import PropertyDetailsView from '../../../../../sections/property/view/property-details-view';

import type { IPropertyItemDetail } from '../../../../../types/property';
// import { useAuthContext } from '../../../../../auth/hooks';
// import { RoleBasedGuard } from '../../../../../auth/guard';


// ----------------------------------------------------------------------

export default function Page() {
  const { id } = useParams();

  const { property, propertyLoading, propertyError } = useGetPropertyDetail(id as string)


  // const { user } = useAuthContext();

  // if (user && user.role === 'ASESOR_INMOBILIARIO') {
  //   if (property && (property as any)?.userId) {
  //     if ((property as any).userId !== String(user.id)) {
  //       return <RoleBasedGuard allowedRoles={['NONE']} hasContent children={<div />} />;
  //     }
  //   }
  // }


  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vista previa de inmueble"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Inmuebles', href: paths.dashboard.properties.root },
          { name: (property as any)?.publicationTitle },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />


      {propertyLoading && <LoadingScreen />}
      {propertyError && <div>Error: {propertyError}</div>}
      {property && (property as any).id && !propertyLoading && <PropertyDetailsView currentProperty={property as IPropertyItemDetail} />}
    </DashboardContent>
  );
}
