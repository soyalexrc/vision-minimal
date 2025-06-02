'use client';

import type { TableHeadCellProps } from 'src/components/table';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { OwnerTableRow } from '../owner-table-row';
import { OwnerTableToolbar } from '../owner-table-toolbar';
import { OwnerQuickEditForm } from '../owner-quick-edit-form';
import { OwnerTableFiltersResult } from '../owner-table-filters-result';
import { deleteOwner, restoreOwner, useGetOwners, deleteManyOwners } from '../../../actions/owner';

import type { IOwnerItem, IOwnerTableFilters } from '../../../types/owner';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'deleted', label: 'Eliminados' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Nombre' },
  { id: 'phoneNumber', label: 'Telefono', width: 180 },
  { id: 'birthdate', label: 'F. Cumpleanos', width: 200 },
  { id: 'isInvestor', label: 'Es inversor?', width: 150 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function OwnerListView() {
  const table = useTable({ defaultRowsPerPage: 25, defaultOrderBy: 'id', defaultDense: true });
  const quickCreateForm = useBoolean();

  const confirmDialog = useBoolean();
  const { owners, ownersError, ownersLoading, ownersEmpty, refetch } =
    useGetOwners();

  const [tableData, setTableData] = useState<IOwnerItem[]>(owners);

  useEffect(() => {
    setTableData(owners || []);
  }, [owners]);

  const filters = useSetState<IOwnerTableFilters>({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id: number) => {
      // Wait for the toast.promise to resolve (shows loading, then success)
      toast.promise(
        (async () => {
          // Call API to delete selected allies
          const { data } = await deleteOwner(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se elimino el propietario',
          error: 'Oops! Algo salio mal',
        }
      );
    },
    [table]
  );

  const handleRestoreRow = useCallback(
    async (id: number) => {
      // Wait for the toast.promise to resolve (shows loading, then success)
      toast.promise(
        (async () => {
          // Call API to delete selected allies
          const { data } = await restoreOwner(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se restauro el propietario',
          error: 'Oops! Algo salio mal',
        }
      );
    },
    [table]
  );

  const handleDeleteRows = useCallback(async () => {
    // Wait for the toast.promise to resolve (shows loading, then success)
    toast.promise(
      (async () => {
        // Call API to delete selected allies
        const ids = table.selected.map(Number);
        const { data } = await deleteManyOwners(ids);

        if (data.error) {
          toast.error(data.message);
          return false;
        }

        refetch();
        table.onSelectAllRows(
          false,
          dataFiltered.map((row) => row.id!.toString())
        );
        return true;
      })(),
      {
        loading: 'Cargando...',
        success: 'Todo listo! Se eliminaron los propietarios',
        error: 'Oops! Algo salio mal',
      }
    );
  }, [table, refetch]);

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
          Estas seguro de eliminar <strong> {table.selected.length} </strong> Propietarios?
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

  const renderQuickCreateForm = () => (
    <OwnerQuickEditForm
      currentOwner={{ email: '', name: '', isInvestor: false, birthdate: undefined, lastname: '', phoneNumber: '', status: 'active' }}
      open={quickCreateForm.value}
      onClose={quickCreateForm.onFalse}
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Propietarios"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Propietarios', href: paths.dashboard.owners.root },
            { name: 'Lista' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.allies.create}
              onClick={quickCreateForm.onTrue}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo propietario
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
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      (tab.value === 'deleted' && 'error') ||
                      'default'
                    }
                  >
                    {['active', 'pending', 'banned', 'rejected', 'deleted'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OwnerTableToolbar filters={filters} onResetPage={table.onResetPage} />

          {canReset && (
            <OwnerTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id!.toString())
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            {
              ownersLoading && (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LoadingScreen />
                </Box>
              )
            }

            {
              ownersError && (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'error.main',
                  }}
                >
                  Error al cargar los aliados. Por favor, intente nuevamente.
                </Box>
              )
            }

            {
              !ownersError && !ownersLoading && owners &&
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headCells={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row) => row.id!.toString())
                      )
                    }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <OwnerTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id!.toString())}
                          onSelectRow={() => table.onSelectRow(row.id!.toString())}
                          onDeleteRow={() => handleDeleteRow(row.id!)}
                          onRestore={() => handleRestoreRow(row.id!)}
                          editHref={paths.dashboard.allies.edit(row.id!)}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    {
                      ownersEmpty &&
                      <TableNoData notFound={notFound} />
                    }
                  </TableBody>
                </Table>
              </Scrollbar>
            }
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
      {renderQuickCreateForm()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IOwnerItem[];
  filters: IOwnerTableFilters;
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

  return inputData;
}
