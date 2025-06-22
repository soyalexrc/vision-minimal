'use client';

import type { TableHeadCellProps } from 'src/components/table';

import { endOfMonth, startOfMonth } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { AllyTableRow } from '../../ally/ally-table-row';
import { AllyQuickEditForm } from '../../ally/ally-quick-edit-form';
import { deleteAlly, restoreAlly, useGetAllies, deleteManyAllies } from '../../../actions/ally';

import type { DateFilters } from './cashflow-list-view';
import type { IAllyItem, IAllyTableFilters } from '../../../types/ally';

// ----------------------------------------------------------------------


const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'id', label: 'ID' },
  { id: 'createdAt', label: 'Fecha de registro' },
  { id: 'data', label: 'Data', width: 180 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function CloseCashFlowView() {
  const table = useTable({ defaultDense: true, defaultOrderBy: 'id', defaultRowsPerPage: 25 });
  const quickCreateForm = useBoolean();
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });

  const confirmDialog = useBoolean();
  const { allies, alliesError, alliesLoading, alliesEmpty, refetch } = useGetAllies();

  const [tableData, setTableData] = useState<IAllyItem[]>([]);

  useEffect(() => {
    setTableData(allies || []);
  }, [allies]);

  const filters = useSetState<IAllyTableFilters>({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const canReset =
    !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id: number) => {
      // Wait for the toast.promise to resolve (shows loading, then success)
      toast.promise(
        (async () => {
          // Call API to delete selected allies
          const {data} = await deleteAlly(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se elimino el aliado',
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
          const {data} = await restoreAlly(id);

          if (data.error) {
            toast.error(data.message);
            return false;
          }

          refetch();
          return true;
        })(),
        {
          loading: 'Cargando...',
          success: 'Todo listo! Se restauro el aliado',
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
        const {data} = await deleteManyAllies(ids);

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
        success: 'Todo listo! Se eliminaron los aliados',
        error: 'Oops! Algo salio mal',
      }
    );
  }, [table, refetch]);

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
          onClick={async () => {
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
    <AllyQuickEditForm
      currentAlly={{ email: '', name: '', lastname: '', phoneNumber: '', status: 'active' }}
      open={quickCreateForm.value}
      onClose={quickCreateForm.onFalse}
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Cierre de caja"
          links={[
            { name: 'Inicio', href: paths.dashboard.root },
            { name: 'Administracion', href: paths.dashboard.root },
            { name: 'Flujo de caja', href: paths.dashboard.allies.root },
            { name: 'Cierre de caja' },
          ]}
          action={
            <Button
              // component={RouterLink}
              // href={paths.dashboard.allies.create}
              variant="contained"
              startIcon={<Iconify icon="akar-icons:reciept" />}
            >
              Cerrar caja
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack direction="row" gap={2} mb={2}>
          <DatePicker
            label="Desde"
            sx={{ width: 200 }}
          />
          <DatePicker
            label="Hasta"
            sx={{ width: 200 }}
          />
          <Button variant="contained" color="primary">
            <Iconify icon="solar:search-bold" />
            Buscar
          </Button>
        </Stack>

        <Card>

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
                <Tooltip title="Eliminar" arrow>
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            {
              alliesLoading && (
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
              alliesError && (
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
              !alliesLoading && !alliesError && allies &&
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
                        <AllyTableRow
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
                      alliesEmpty && (
                        <TableNoData notFound={notFound} />
                      )
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
  inputData: IAllyItem[];
  filters: IAllyTableFilters;
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

