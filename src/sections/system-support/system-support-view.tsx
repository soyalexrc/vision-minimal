'use client';

import { paths } from '../../routes/paths';
import { ComingSoonView } from '../common/coming-soon';
import { DashboardContent } from '../../layouts/dashboard';
import { CustomBreadcrumbs } from '../../components/custom-breadcrumbs';

export function SystemSupportView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Soporte del sistema"
        links={[
          { name: 'Inicio', href: paths.dashboard.root },
          { name: 'Administración' },
          { name: 'Soporte del sistema' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ComingSoonView />

      {/*<TicketManagerWrapper*/}
      {/*  apiKey="your-api-key-here"*/}
      {/*  baseUrl="https://your-api.com"*/}
      {/*  theme="light"*/}
      {/*  defaultView="kanban"*/}
      {/*  className="w-full h-screen"*/}
      {/*/>*/}
      {/* <TicketManagerScript apiKey="" /> */}
    </DashboardContent>
  );
}
