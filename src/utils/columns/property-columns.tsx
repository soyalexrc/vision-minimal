import type { GridColDef } from '@mui/x-data-grid';

import { paths } from '../../routes/paths';
import { fDateTimeVE2 } from '../format-time';
import { formatCodeVINM } from '../format-string';
import { RenderCellPrice } from '../../sections/product/product-table-row';
import {
  RenderCell,
  RenderCellProperty,
  RenderCellStatusAndFeatured,
} from '../../sections/property/property-table-row';

export const propertyColumns: GridColDef[] = [
  {
    field: 'code',
    headerName: 'Codigo',
    filterable: true,
    renderCell: (params) => (
      <RenderCell params={params} value={params.row.code || formatCodeVINM(params.row.codeId)} />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Fecha de registro',
    flex: 1,
    minWidth: 170,
    renderCell: (params) => {
      console.log('params.row.createdAt', params.row.createdAt);
      const date = fDateTimeVE2(params.row.createdAt);
      if (!date) {
        return <RenderCell params={params} value="N/A" />;
      }
      const dateString = `${date.date} ${date.time}`;
      return (
        <RenderCell params={params} value={dateString} />
      )
    },
  },
  {
    field: 'status',
    headerName: 'Estatus',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => (
      <RenderCellStatusAndFeatured
        params={params}
        featured={params.row.isFeatured}
        value={params.row.status}
      />
    ),
  },
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
];
