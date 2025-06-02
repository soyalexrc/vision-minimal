import type { GridColDef } from '@mui/x-data-grid';

import { paths } from '../../routes/paths';
import { RenderCellPrice } from '../../sections/product/product-table-row';
import {
  RenderCell, RenderCellProperty, RenderCellStatusAndFeatured,
} from '../../sections/property/property-table-row';

export const propertyColumns: GridColDef[] = [
  { field: 'code', headerName: 'Codigo', filterable: true },
  {
    field: 'publicationTitle',
    headerName: 'Titulo de publicacion',
    flex: 1,
    minWidth: 320,
    renderCell: (params) => (
      // const url = `/dashboard/clients/view/${params.row.id}`;
      // <RenderCellRedirect redirectTo={url} params={params} value={params.row.name} />
      <RenderCellProperty
        params={params}
        href={paths.dashboard.properties.details(params.row.id)}
      />
    ),
  },
  {
    field: 'propertyType',
    headerName: 'Tipo de inmueble',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => <RenderCell params={params} value={params.row.propertyType} />,
  },
  {
    field: 'operationType',
    headerName: 'Tipo de operacion',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => <RenderCell params={params} value={params.row.operationType} />,
  },
  {
    field: 'realstateadvisername',
    headerName: 'Asesor',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => <RenderCell params={params} value={params.row.realstateadvisername} />,
  },
  {
    field: 'price',
    headerName: 'Precio',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => <RenderCellPrice params={params} value={params.row.price} />,
  },
  {
    field: 'status',
    headerName: 'Estatus',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => <RenderCellStatusAndFeatured params={params} featured={params.row.isFeatured} value={params.row.status} />,
  },
];
