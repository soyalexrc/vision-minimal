'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { GridRowSelectionModel, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, usePopover, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { DataGrid, gridClasses } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, rowInPage, getComparator } from 'src/components/table';

import { useGetClients } from '../../../actions/client';
import { EmptyContent } from '../../../components/empty-content';
import { ClientGridTableToolbar } from '../client-table-toolbar';
import { CustomPopover } from '../../../components/custom-popover';
import { clientColumns } from '../../../utils/columns/client-columns';

import type { IClientItem, IClientDataFilters } from '../../../types/client';
import MenuList from '@mui/material/MenuList';
import { RouterLink } from '../../../routes/components';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  {
    value: 'concreted',
    label: 'Concretado',
  },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'deleted', label: 'Eliminado' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nombre' },
  { id: 'phone', label: 'Telefono', width: 180 },
  { id: 'adviserName', label: 'Nombre de asesor' },
  { id: 'serviceName', label: 'Servicio', width: 180 },
  { id: 'propertytype', label: 'Tipo de inmueble', width: 180 },
  { id: 'propertyOfInterest', label: 'Inmueble por el cual nos contacta', width: 180 },
  { id: 'contactFrom', label: 'de donde nos contacta', width: 180 },
  { id: 'specificRequirement', label: 'Detalle de la solicitud', width: 180 },
  { id: 'requestracking', label: 'Seguimiento', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'isinwaitinglist', label: 'Lista de espera', width: 180 },
  { id: 'isPotentialInvestor', label: 'Potencial inversor', width: 180 },
  { id: 'budget', label: 'Presupuesto', width: 180 },
  { id: 'typeOfPerson', label: 'Perfil de cliente', width: 180 },
  { id: 'allowyounger', label: 'Menores de edad', width: 180 },
  { id: 'allowpets', label: 'Mascotas', width: 180 },
  { id: '', width: 88 },
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

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id!.toString() !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id!.toString()));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

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
          Estas seguro de eliminar <strong> {table.selected.length} </strong> Aliados?
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
              disableRowSelectionOnClick
              rows={dataFiltered}
              columns={[
                {
                  field: 'actions',
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
                  renderCell: (params) => {
                    const popover = usePopover();

                    return (
                      <Stack>
                        <IconButton
                          color={popover.open ? 'inherit' : 'default'}
                          onClick={popover.onOpen}
                        >
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                        <CustomPopover
                          anchorEl={popover.anchorEl}
                          open={popover.open}
                          onClose={popover.onClose}
                          sx={{ width: 190 }}
                        >
                          <MenuList>
                            <MenuItem
                              onClick={() => {
                                // onViewSummary(params.row);
                                popover.onClose();
                              }}
                            >
                              <Iconify icon="material-symbols:description" />
                              Ver resumen
                            </MenuItem>

                            <MenuItem
                              onClick={() => {
                                // onEdit(params.row);
                                popover.onClose();
                              }}
                              sx={{ color: 'info.main' }}
                            >
                              <Iconify icon="eva:edit-2-fill" />
                              Editar
                            </MenuItem>

                            <MenuItem
                              onClick={() => {
                                // onDelete(params.row);
                                popover.onClose();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Iconify icon="eva:trash-2-outline" />
                              Eliminar
                            </MenuItem>
                          </MenuList>
                        </CustomPopover>
                      </Stack>
                    )
                  },
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
