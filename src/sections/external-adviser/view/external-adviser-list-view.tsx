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

import { getStatus } from '../../../utils/get-status';
import { ExternalAdviserTableRow } from '../external-adviser-table-row';
import { ExternalAdviserTableToolbar } from '../external-adviser-table-toolbar';
import { ExternalAdviserQuickEditForm } from '../external-adviser-quick-edit-form';
import { ExternalAdviserTableFiltersResult } from '../external-adviser-table-filters-result';
import {
  deleteExternalAdviser, restoreExternalAdviser,
  useGetExternalAdvisers,
  deleteManyExternalAdvisers,
} from '../../../actions/external-adviser';

import type { GetStatusType } from '../../../utils/get-status';
import type { IExternalAdviserItem, IExternalAdviserFilters } from '../../../types/external-adviser';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Todos' }, { value: 'active', label: 'Activos' }, { value: 'deleted', label: 'Eliminados' }];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Nombre' },
  { id: 'phoneNumber', label: 'Telefono', width: 180 },
  { id: 'realStateCompanyName', label: 'Compania', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function ExternalAdviserListView() {
  const table = useTable({ defaultDense: true, defaultOrderBy: 'id', defaultRowsPerPage: 25 });
  const quickCreateForm = useBoolean();

  const confirmDialog = useBoolean();
  const { advisers, advisersError, advisersLoading, advisersEmpty, refetch } = useGetExternalAdvisers();

  const [tableData, setTableData] = useState<IExternalAdviserItem[]>(advisers);

  useEffect(() => {
    setTableData(advisers || []);
  }, [advisers]);

  const filters = useSetState<IExternalAdviserFilters>({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;


  const handleDeleteRow = useCallback(
    async (id: number) => {
      // Wait for the toast.promise to resolve (shows loading, then success)
      toast.promise(
        (async () => {
          // Call API to delete selected allies
          const {data} = await deleteExternalAdviser(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se elimino el asesor',
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
          const {data} = await restoreExternalAdviser(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se restauro el asesor',
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
        const {data} = await deleteManyExternalAdvisers(ids);

        if (data.error) {
          toast.error(data.message);
          return false;
        }

        refetch();
        table.onSelectAllRows(
          false,
          dataFiltered.map((row) => row.id!.toString())
        )
        return true;
      })(),
      {
        loading: 'Cargando...',
        success: 'Todo listo! Se eliminaron los asesores',
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
          Estas seguro de eliminar <strong> {table.selected.length} </strong> Asesores externos?
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
    <ExternalAdviserQuickEditForm
      currentExternalAdviser={{ phoneNumber: '', lastname: '', status: 'active', name: '', realStateCompanyName: '', email: '' }}
      open={quickCreateForm.value}
      onClose={quickCreateForm.onFalse}
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Asesores Externos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Asesores Externos', href: paths.dashboard.externalAdvisers.root },
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
              Nuevo asesor externo
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
                    color={getStatus(tab.value as GetStatusType).variant}
                  >
                    {['active', 'pending', 'banned', 'rejected', 'deleted'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <ExternalAdviserTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
          />

          {canReset && (
            <ExternalAdviserTableFiltersResult
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
              advisersLoading && (
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
              advisersError && (
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
              !advisersError && !advisersLoading && advisers &&
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
                        <ExternalAdviserTableRow
                          key={row.id}
                          row={row}
                          onRestore={() => handleRestoreRow(row.id!)}
                          selected={table.selected.includes(row.id!.toString())}
                          onSelectRow={() => table.onSelectRow(row.id!.toString())}
                          onDeleteRow={() => handleDeleteRow(row.id!)}
                          editHref={paths.dashboard.allies.edit(row.id!)}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    {
                      advisersEmpty &&
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
  inputData: IExternalAdviserItem[];
  filters: IExternalAdviserFilters;
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
