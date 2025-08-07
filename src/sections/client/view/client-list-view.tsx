'use client';

import type { AxiosResponse } from 'axios';
import type { GridRowSelectionModel, GridColumnVisibilityModel} from '@mui/x-data-grid';

import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import React, { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { esES } from '@mui/x-data-grid/locales';
import { DataGrid, gridClasses , GridActionsCellItem } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, getComparator } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from '../../../auth/hooks';
import { isAdmin } from '../../../utils/roles.mapper';
import { RouterLink } from '../../../routes/components';
import { GridActionsLinkItem } from '../../product/view';
import { EmptyContent } from '../../../components/empty-content';
import { ClientGridTableToolbar } from '../client-table-toolbar';
import { getClientColumns } from '../../../utils/columns/client-columns';
import {
  deleteClient, restoreClient,
  useGetClients,
  deleteManyClients, changeClientStatus,
} from '../../../actions/client';

import type { IClientItem, IClientDataFilters } from '../../../types/client';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'reserved', label: 'Reservado' },
  {
    value: 'concreted',
    label: 'Concretado',
  },
  { value: 'inactive', label: 'Inactivo' },
  // { value: 'deleted', label: 'Eliminado' },
];

// ----------------------------------------------------------------------

export function ClientListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 25, defaultOrderBy: 'id' });
  const confirmDialog = useBoolean();
  const { clients, refresh, clientsLoading } = useGetClients();
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  const [tableData, setTableData] = useState<IClientItem[]>(clients);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const filters = useSetState<IClientDataFilters>({ name: '', status: 'all' });
  const { user } = useAuthContext();

  const { state: currentFilters, setState: updateFilters } = filters;

  const CustomToolbarCallback = useCallback(
    () => (
      <ClientGridTableToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFilters, selectedRowIds]
  );

  const getTogglableColumns = () =>
    getClientColumns(user)
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  useEffect(() => {
    if (clients?.length > 0) {
      setTableData(clients);
    }
  }, [clients]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const handleDeleteRow = async (id: number) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await deleteClient(id);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registro eliminado!',
      error: (error) => error || 'Error al eliminar el registro!',
    });

    refresh();
  };

  const handleRestoreRow = async (id: number) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await restoreClient(id);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registro restaurado!',
      error: (error) => error || 'Error al restaurar el registro!',
    });

    refresh();
  };

  const handleDeleteRows = async () => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await deleteManyClients(selectedRowIds as number[]);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registros eliminados!',
      error: (error) => error || 'Error al eliminar los registros!',
    });

    refresh();
  };

  const handleChangeRowStatus = async (id: number, statusTo: string) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await changeClientStatus(id, statusTo);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registros eliminados!',
      error: (error) => error || 'Error al eliminar los registros!',
    });

    refresh();
  };

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Eliminar"
      content={
        <>
          Estas seguro de eliminar <strong> {selectedRowIds.length} </strong> Clientes?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Eliminar
        </Button>
      }
    />
  );

  function onCopyInfo(row: IClientItem) {
    // Build referrer line based on contactFrom value
    let referrerLine = '';
    if (row.contactFrom === 'Referido' && (row as any).referrer) {
      referrerLine = `Referido por: ${(row as any).referrer}\n      `;
    } else if (row.contactFrom === 'Cliente conocido' && (row as any).referrer) {
      referrerLine = `Cliente conocido: ${(row as any).referrer}\n      `;
    } else if (row.contactFrom === 'Cliente recurrente' && (row as any).referrer) {
      referrerLine = `Cliente recurrente: ${(row as any).referrer}\n      `;
    } else if (row.contactFrom === 'Grupos Inmobiliarios' && (row as any).referrer) {
      referrerLine = `Grupo inmobiliario: ${(row as any).referrer}\n      `;
    }

    const copyText = [
      `Numero de cliente: ${row.id}`,
      `Nombre de cliente: ${row.name} ${row.lastname || ''}`,
      row.assignedto?.id && `Nombre de asesor asignado: ${row.assignedto.name}`,
      row.phone && `Teléfono: ${row.phone}`,
      row.contactFrom && `Nos contacta desde: ${row.contactFrom} ${referrerLine}`,
      row.propertytype && `Tipo de inmueble: ${row.propertytype}`,
      row.propertyOfInterest && `Inmueble de interés: ${row.propertyOfInterest}`,
      row.specificRequirement && `Requerimiento específico: ${row.specificRequirement}`,
      row.serviceName && `Servicio: ${row.serviceName}`,
      row.typeOfPerson && `Perfil de cliente: ${row.typeOfPerson}`,
      row.budgetto && `Presupuesto hasta: $${row.budgetto.toLocaleString()}`,
      row.allowpets && row.allowpets !== 'N/A' && `Mascotas: ${row.allowpets}`,
      row.amountOfPets && row.amountOfPets > 0 && `Cantidad de mascotas: ${row.amountOfPets}`,
      row.allowyounger && row.allowyounger !== 'N/A' && `Menores de edad: ${row.allowyounger}`,
      row.amountOfYounger && row.amountOfYounger > 0 && `Cantidad de menores: ${row.amountOfYounger}`,
      Array.isArray(row.zonesOfInterest) && row.zonesOfInterest.length > 0 && `Zona de interés: ${row.zonesOfInterest.join(', ')}`,
      Array.isArray(row.essentialFeatures) && row.essentialFeatures.length > 0 && `Caracteristicas escenciales: ${row.essentialFeatures.join(', ')}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(copyText).then(() => {
      toast.success('Información del cliente copiada al portapapeles');
    }).catch((error) => {
      toast.error('Error al copiar la información del cliente');
      console.error('Error copying text: ', error);
    });
  }

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Clientes"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Clientes', href: paths.dashboard.clients.root },
            { name: 'Lista' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.clients.create}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo cliente
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'concreted' && 'info') ||
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'deleted' && 'error') ||
                      (tab.value === 'reserved' && 'warning') ||
                      'default'
                    }
                  >
                    {['active', 'concreted', 'inactive', 'rejected', 'deleted', 'reserved'].includes(tab.value)
                      ? tableData.filter((property) => property.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Card
            sx={{
              minHeight: 640,
              flexGrow: { md: 1 },
              display: { md: 'flex' },
              height: { xs: 800, md: '1px' },
              flexDirection: { md: 'column' },
            }}
          >
            <DataGrid
              checkboxSelection={user.role !== 'ASESOR_INMOBILIARIO'}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              disableRowSelectionOnClick
              rows={dataFiltered}
              columns={[
                {
                  field: 'actions',
                  type: 'actions',
                  headerName: '',
                  align: 'center',
                  filterable: false,
                  width: 50,
                  disableExport: true,
                  editable: false,
                  groupable: false,
                  sortable: false,
                  resizable: false,
                  disableColumnMenu: true,
                  headerAlign: 'center',
                  getActions: (params) => [
                    ...(user.role !== 'ASESOR_INMOBILIARIO' || params.row.createdby?.id == user.id || params.row.assignedto?.id == user.id
                      ? [
                          <GridActionsLinkItem
                            showInMenu
                            icon={<Iconify icon="solar:eye-bold" />}
                            label="Ver detalle"
                            href={paths.dashboard.clients.details(params.row.id)}
                          />,
                        ]
                      : []),
                    ...(params.row.status !== 'deleted' &&
                    (user.role !== 'ASESOR_INMOBILIARIO' || params.row.createdby?.id == user.id || params.row.assignedto?.id == user.id)
                      ? [
                          <GridActionsLinkItem
                            showInMenu
                            icon={<Iconify icon="eva:edit-2-fill" />}
                            label="Editar"
                            href={paths.dashboard.clients.edit(params.row.id)}
                          />,
                        ]
                      : []),
                       <GridActionsCellItem
                            showInMenu
                            onClick={() => onCopyInfo(params.row)}
                            icon={<Iconify icon="material-symbols:share" />}
                            label="Copiar información"
                          />,
                    ...(params.row.status !== 'deleted' &&
                    params.row.status !== 'concreted' &&
                    (isAdmin(user.role) || params.row.createdby?.id == user.id || params.row.assignedto?.id == user.id)
                      ? [
                          <GridActionsCellItem
                            showInMenu
                            onClick={() => handleChangeRowStatus(params.row.id, params.row.status === 'active' ? 'inactive' : 'active')}
                            icon={<Iconify icon={params.row.status === 'active' ? 'lsicon:disable-outline' : 'lets-icons:check-fill' } />}
                            label={`Marcar como ${params.row.status === 'active' ? 'inactivo' : 'activo'}`}
                            sx={{ color: params.row.status === 'active' ? 'warning.main' : 'success.main' }}
                          />,
                          <GridActionsCellItem
                            showInMenu
                            onClick={() => handleChangeRowStatus(params.row.id, 'concreted')}
                            icon={<Iconify icon="lets-icons:check-fill" />}
                            label="Marcar como concretado"
                            sx={{ color: 'info.main' }}
                          />,
                           <GridActionsCellItem
                            showInMenu
                            onClick={() => handleChangeRowStatus(params.row.id, 'reserved')}
                            icon={<Iconify icon="lets-icons:check-fill" />}
                            label="Marcar como reservado"
                            sx={{ color: 'purple' }}
                          />,
                        ]
                      : []),
                    ...(params.row.status !== 'deleted' &&
                    params.row.status !== 'concreted' && isAdmin(user.role)
                      ? [
                        <GridActionsCellItem
                          showInMenu
                          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                          label="Eliminar"
                          onClick={() => handleDeleteRow(params.row.id)}
                          sx={{ color: 'error.main' }}
                        />,
                      ]
                      : []),
                    ...(params.row.status === 'deleted' &&
                    (user.role !== 'ASESOR_INMOBILIARIO' || params.row.createdby?.id === user.id || params.row.assignedto?.id === user.id)
                      ? [
                          <GridActionsCellItem
                            showInMenu
                            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            label="Restaurar"
                            onClick={() => handleRestoreRow(params.row.id)}
                            sx={{ color: 'info.main' }}
                          />,
                        ]
                      : []),
                  ],
                },
                ...getClientColumns(user),
              ]}
              loading={clientsLoading}
              getRowHeight={() => 'auto'}
              pageSizeOptions={[25, 50, 100, { value: -1, label: 'All' }]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              onRowSelectionModelChange={(newSelectionModel) =>
                setSelectedRowIds(newSelectionModel)
              }
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
              slots={{
                toolbar: CustomToolbarCallback,
                noRowsOverlay: () => <EmptyContent />,
                noResultsOverlay: () => <EmptyContent title="No results found" />,
              }}
              slotProps={{
                toolbar: { setFilterButtonEl },
                panel: { anchorEl: filterButtonEl },
                columnsManagement: { getTogglableColumns },
              }}
              sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
            />
          </Card>

          {/*<Box sx={{ position: 'relative' }}>*/}
          {/*  <TableSelectedAction*/}
          {/*    dense={table.dense}*/}
          {/*    numSelected={table.selected.length}*/}
          {/*    rowCount={dataFiltered.length}*/}
          {/*    onSelectAllRows={(checked) =>*/}
          {/*      table.onSelectAllRows(*/}
          {/*        checked,*/}
          {/*        dataFiltered.map((row) => row.id!.toString())*/}
          {/*      )*/}
          {/*    }*/}
          {/*    action={*/}
          {/*      <Tooltip title="Delete">*/}
          {/*        <IconButton color="primary" onClick={confirmDialog.onTrue}>*/}
          {/*          <Iconify icon="solar:trash-bin-trash-bold" />*/}
          {/*        </IconButton>*/}
          {/*      </Tooltip>*/}
          {/*    }*/}
          {/*  />*/}

          {/*  {*/}
          {/*    clientsLoading &&*/}
          {/*    <Box sx={{ height: 400, justifyContent: 'center', alignItems: 'center' }}>*/}
          {/*      <LoadingScreen />*/}
          {/*    </Box>*/}
          {/*  }*/}

          {/*  {*/}
          {/*    !clientsLoading && clients.length > 0 &&*/}
          {/*    <Scrollbar>*/}
          {/*      <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>*/}
          {/*        <TableHeadCustom*/}
          {/*          order={table.order}*/}
          {/*          orderBy={table.orderBy}*/}
          {/*          headCells={TABLE_HEAD}*/}
          {/*          rowCount={dataFiltered.length}*/}
          {/*          numSelected={table.selected.length}*/}
          {/*          onSort={table.onSort}*/}
          {/*          onSelectAllRows={(checked) =>*/}
          {/*            table.onSelectAllRows(*/}
          {/*              checked,*/}
          {/*              dataFiltered.map((row) => row.id!.toString())*/}
          {/*            )*/}
          {/*          }*/}
          {/*        />*/}
          {/*        <TableBody>*/}
          {/*          {dataFiltered*/}
          {/*            .slice(*/}
          {/*              table.page * table.rowsPerPage,*/}
          {/*              table.page * table.rowsPerPage + table.rowsPerPage*/}
          {/*            )*/}
          {/*            .map((row) => (*/}
          {/*              <ClientTableRow*/}
          {/*                key={row.id}*/}
          {/*                row={row}*/}
          {/*                selected={table.selected.includes(row.id!.toString())}*/}
          {/*                onSelectRow={() => table.onSelectRow(row.id!.toString())}*/}
          {/*                onDeleteRow={() => handleDeleteRow(row.id!.toString())}*/}
          {/*                editHref={paths.dashboard.clients.edit(row.id!)}*/}
          {/*              />*/}
          {/*            ))}*/}

          {/*          <TableEmptyRows*/}
          {/*            height={table.dense ? 56 : 56 + 20}*/}
          {/*            emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}*/}
          {/*          />*/}

          {/*          <TableNoData notFound={notFound} />*/}
          {/*        </TableBody>*/}
          {/*      </Table>*/}
          {/*    </Scrollbar>*/}
          {/*  }*/}
          {/*</Box>*/}

          {/*<TablePaginationCustom*/}
          {/*  page={table.page}*/}
          {/*  dense={table.dense}*/}
          {/*  count={dataFiltered.length}*/}
          {/*  rowsPerPage={table.rowsPerPage}*/}
          {/*  onPageChange={table.onChangePage}*/}
          {/*  onChangeDense={table.onChangeDense}*/}
          {/*  onRowsPerPageChange={table.onChangeRowsPerPage}*/}
          {/*/>*/}
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IClientItem[];
  filters: IClientDataFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((user) => role.includes(user.role));
  // }

  return inputData;
}
