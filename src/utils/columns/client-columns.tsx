import type { GridColDef } from '@mui/x-data-grid';

import { fDateTimeVE2 } from '../format-time';
import {
  RenderCell,
  RenderCellPhone, RenderCellAmount,
  RenderCellStatus, ConditionalRenderCell,
} from '../../sections/client/client-table-row';

import type { UserType } from '../../auth/types';

export function getClientColumns(user: UserType): GridColDef[] {
  return [
    { field: 'id', headerName: 'ID', filterable: true, width: 80 },
    {
      field: 'status',
      headerName: 'Estatus',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <RenderCellStatus params={params} value={params.row.status} />
      ),
    },
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 320,
      renderCell: (params) =>
        // const url = `/dashboard/clients/view/${params.row.id}`;
        (
          // <RenderCellRedirect redirectTo={url} params={params} value={params.row.name} />
          <ConditionalRenderCell user={user} params={params} value={params.row.name} />
        )
    },
    {
      field: 'createdat',
      headerName: 'Fecha de registro',
      flex: 1,
      minWidth: 170,
      renderCell: (params) => {
        console.log('params.row.createdat', params.row.createdat);
        const date = fDateTimeVE2(params.row.createdat);
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
      field: 'phone',
      headerName: 'Telefono',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <RenderCellPhone user={user} params={params} value={params.row.phone} />
      ),
    },
    // {
    //   field: 'adviserName',
    //   headerName: 'Nombre de asesor',
    //   flex: 1,
    //   minWidth: 200,
    //   renderCell: (params) => (
    //     <RenderCell params={params} value={params.row.adviserName} />
    //   ),
    // },
    {
      field: 'createdby',
      headerName: 'Creado por',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => row.createdby?.name || '',
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.createdby?.name} />
      ),
    },
    {
      field: 'assignedto.name',
      headerName: 'Asignado a',
      flex: 1,
      minWidth: 200,
      valueGetter: (_, row) => row.assignedto?.name || '',
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.assignedto?.name} />
      ),
    },
    {
      field: 'serviceName',
      headerName: 'Nombre de servicio',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.serviceName} />
      ),
    },
    {
      field: 'propertytype',
      headerName: 'Tipo de inmueble',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.propertytype} />
      ),
    },
    {
      field: 'propertyOfInterest',
      headerName: 'Inmueble por el cual nos contacta',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <ConditionalRenderCell user={user} params={params} value={params.row.propertyOfInterest} />
      ),
    },
    {
      field: 'contactFrom',
      headerName: 'De donde nos contacta',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <ConditionalRenderCell user={user} params={params} value={params.row.contactFrom} />
      ),
    },
    {
      field: 'specificRequirement',
      headerName: 'Detalle de la solicitud',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.specificRequirement} />
      ),
    },
    {
      field: 'requestracking',
      headerName: 'Seguimiento',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <ConditionalRenderCell user={user} params={params} value={params.row.requestracking} />
      ),
    },
    {
      field: 'isinwaitinglist',
      headerName: 'Lista de espera',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCellStatus params={params} value={params.row.isinwaitinglist ? 'yes' : 'no'} />
      ),
    },
    {
      field: 'isPotentialInvestor',
      headerName: 'Potencial inversor',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCellStatus params={params} value={params.row.isPotentialInvestor ? 'yes' : 'no'} />
      ),
    },
    {
      field: 'budgetfrom',
      headerName: 'Presupuesto desde',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCellAmount params={params} value={params.row.budgetfrom} />
      ),
    },
    {
      field: 'budgetto',
      headerName: 'Presupuesto hasta',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCellAmount params={params} value={params.row.budgetto} />
      ),
    },
    {
      field: 'typeOfPerson',
      headerName: 'Perfil de cliente',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCell params={params} value={params.row.typeOfPerson} />
      ),
    },
    {
      field: 'allowyounger',
      headerName: 'Menores de edad',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const value = params.row.allowyounger === '' ? 'N/A' : params.row.allowyounger === 'Si' ? 'yes' : params.row.allowyounger;
        return <RenderCellStatus params={params} value={value} />},
    },
    {
      field: 'allowpets',
      headerName: 'Presencia de Mascotas',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <RenderCellStatus params={params} value={params.row.allowpets === 'Si' ? 'yes' : params.row.allowpets} />
      ),
    },
  ];
}
