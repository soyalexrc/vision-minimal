
'use client';

import type { AxiosResponse } from 'axios';
import type { GridRowSelectionModel, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { esES } from '@mui/x-data-grid/locales';
import { DataGrid, gridClasses, GridActionsCellItem  } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, rowInPage, getComparator } from 'src/components/table';

import { useRouter } from '../../../routes/hooks';
import { RouterLink } from '../../../routes/components';
import { GridActionsLinkItem } from '../../product/view';
import { EmptyContent } from '../../../components/empty-content';
import { ClientGridTableToolbar } from '../../client/client-table-toolbar';
import { clientColumns } from '../../../utils/columns/client-columns';
import {
  deleteClient, restoreClient,
  useGetClients,
  deleteManyClients,
} from '../../../actions/client';

import type { IClientItem, IClientDataFilters } from '../../../types/client';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'deleted', label: 'Eliminado' },
];

// ----------------------------------------------------------------------

export function PropertyListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 25, defaultOrderBy: 'id' });
  const confirmDialog = useBoolean();
  const { clients, refresh, clientsLoading } = useGetClients();
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  const [tableData, setTableData] = useState<IClientItem[]>(clients);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const router = useRouter();
  const filters = useSetState<IClientDataFilters>({ name: '', status: 'all' });

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
    clientColumns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  useEffect(() => {
    if (clients?.length > 0) {
      setTableData(clients);
    }
  }, [clients]);

  // const filters = useSetState<IClientDataFilters>({ name: '', status: 'all' });
  // const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Inmuebles"
          links={[
            { name: 'Inicio', href: paths.dashboard.root },
            { name: 'Inmuebles', href: paths.dashboard.properties.root },
            { name: 'Lista' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.clients.create}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo inmueble
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
                      'default'
                    }
                  >
                    {['active', 'concreted', 'inactive', 'rejected', 'deleted'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
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
              checkboxSelection
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
                    <GridActionsLinkItem
                      showInMenu
                      icon={<Iconify icon="solar:eye-bold" />}
                      label="Ver detalle"
                      href={paths.dashboard.clients.details(params.row.id)}
                    />,
                    ...(params.row.status !== 'deleted'
                        ? [
                          <GridActionsLinkItem
                            showInMenu
                            icon={<Iconify icon="eva:edit-2-fill" />}
                            label="Editar"
                            href={paths.dashboard.clients.edit(params.row.id)}
                          />
                        ] : []
                    ),
                    ...(params.row.status !== 'deleted'
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
                    ...(params.row.status === 'deleted'
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
                  ]
                },
                ...clientColumns,
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
