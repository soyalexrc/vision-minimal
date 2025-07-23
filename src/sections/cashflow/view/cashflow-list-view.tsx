'use client';

import type { TableHeadCellProps } from 'src/components/table';

import { varAlpha } from 'minimal-shared/utils';
import { endOfDay, startOfDay } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';

import { isAdmin } from 'src/utils/roles.mapper';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
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

import { useAuthContext } from 'src/auth/hooks';

import { getStatus } from '../../../utils/get-status';
import CashFlowDashboard from '../cashflow-dashboard';
import { CashFlowTableRow } from '../cashflow-table-row';
import { CashflowMoneyMovementDialog } from '../cashflow-money-movement-dialog';
import { useGetCashFlows, useGetCashFlowTotals } from '../../../actions/cashflow';

import type { GetStatusType } from '../../../utils/get-status';
import type { ICashFlowItem, ICashFlowTableFilters } from '../../../types/cashflow';
// import { CashFlowTableToolbar } from '../cashflow-table-toolbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'regular', label: 'Regular' },
  { value: 'change', label: 'Cambio' },
  { value: 'return', label: 'Devolucion' },
  { value: 'internal_admin', label: 'Administración Interna' },
  { value: 'expense', label: 'Gastos' },
  { value: 'purchase', label: 'Compras' },
  { value: 'money_movement', label: 'Traslado de dinero' },
];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'id', label: 'ID', width: 88 },
  { id: 'date', label: 'Fecha de registro', sx: { minWidth: 120 } },
  { id: 'updatedAt', label: 'Ultima F. de actualizacion', width: 140 },
  { id: 'person.name', label: 'Persona', sx: { minWidth: 300 } },
  { id: 'paymentsQty', label: 'C. Transac', align: 'center', sx: { minWidth: 110 } },
  { id: 'totalIncomeOutcome', label: 'Ingreso / Egreso', sx: { minWidth: 100 } },
  { id: 'totalPendingToCollectAndDue', label: 'Por cobrar / Por Pagar', sx: { minWidth: 100 } },
  { id: '', width: 88 },
];

// Interface for date filters
export interface DateFilters {
  startDate: Date | string | number;
  endDate: Date | string | number;
}

const defaultFilters = {
  startDate: startOfDay(new Date()),
  endDate: endOfDay(new Date()),
}

// ----------------------------------------------------------------------

export function CashFlowListView() {
  const table = useTable({
    defaultDense: true,
    defaultOrderBy: 'updatedAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
  });
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
  });
  const { user } = useAuthContext();
  const { cashflow, cashflowLoading, cashflowError, refetchWithParams } = useGetCashFlows(defaultFilters);
  const { totalsData, totalsLoading, totalsError, refetchWithParams: refetchTotals } = useGetCashFlowTotals(defaultFilters);
  const confirmDialog = useBoolean();
  const moneyMovementDialog = useBoolean();
  const [tableData, setTableData] = useState<ICashFlowItem[]>([]);

  useEffect(() => {
    setTableData(cashflow || []);
  }, [cashflow]);


  const filters = useSetState<ICashFlowTableFilters>({
    name: '',
    status: 'all',
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  // const dateError = fIsAfter(currentFilters.startDate.value!, currentFilters.endDate.value!);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';
  // currentFilters.status !== 'all' ||
  // (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: number) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData],
  );

  // Fixed onSubmit function
  const onSubmit = async () => {
    const {startDate, endDate} = dateFilters;
    if (!startDate || !endDate) {
      toast.error('Por favor, seleccione las fechas de inicio y fin.');
      return;
    }
    if (startDate > endDate) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    refetchTotals(dateFilters);
    refetchWithParams(dateFilters)
  };

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table],
  );

  const renderMoneyMovementDialog = () => (
     <CashflowMoneyMovementDialog
        open={moneyMovementDialog.value}
        onClose={moneyMovementDialog.onFalse}
        onSuccess={onSubmit}
      />
  )

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
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
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Flujo de caja"
          links={[
            { name: 'Inicio', href: paths.dashboard.root },
            { name: 'Administración' },
            { name: 'Flujo de Caja', href: paths.dashboard.cashFlow.root },
            { name: 'Listado' },
          ]}
          action={
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
             {
              isAdmin(user.role) &&
               <Button
                variant="contained"
                color="info"
                onClick={moneyMovementDialog.onTrue}
                startIcon={<Iconify icon="solar:plus-bold" />}
              >
                Traslado de dinero
              </Button>
             }
              <Button
                component="a"
                href={paths.dashboard.cashFlow.create}
                variant="contained"
                startIcon={<Iconify icon="solar:plus-bold" />}
              >
                Nueva transacción
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Stack direction="row" gap={2}>
          <DatePicker
            slotProps={{
              textField: {
                size: 'small',
              }
            }}
            value={dateFilters.startDate as Date}
            onChange={(date) => {
              if (date) {
                setDateFilters((prev) => ({
                  ...prev,
                  startDate: date,
                }));
              }
            }}
            label="Desde"
            sx={{ width: 200 }}
          />
          <DatePicker
            label="Hasta"
                slotProps={{
              textField: {
                size: 'small',
              }
            }}
            value={dateFilters.endDate as Date}
            onChange={(date) => {
              if (date) {
                setDateFilters((prev) => ({
                  ...prev,
                  endDate: date,
                }));
              }
            }}

            sx={{ width: 200 }}
          />
          <Button onClick={onSubmit} variant="contained" color="primary">
            <Iconify icon="solar:search-bold" />
              Buscar
          </Button>
        </Stack>
        {
          totalsLoading && (
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
          totalsError && (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                color: 'error.main',
              }}
            >
              Error al cargar los totales. Por favor, intente nuevamente.
            </Box>
          )
        }

        {
          !totalsLoading && !totalsError && totalsData &&
          <CashFlowDashboard data={totalsData as any} />
        }
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
                    color={getStatus(tab.value as GetStatusType)?.variant || 'default'}
                  >
                    {['change', 'regular', 'return', 'internal_admin', 'money_movement', 'expense', 'purchase'].includes(tab.value)
                      ? tableData.filter((cf) => cf.type === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          {/* <CashFlowTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
          /> */}

          {/* {canReset && (
            <CashFlowTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id.toString()),
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
              cashflowLoading && (
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
              cashflowError && (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'error.main',
                  }}
                >
                  Error al cargar los registros. Por favor, intente nuevamente.
                </Box>
              )
            }

            {
              !cashflowLoading && !cashflowError && cashflow &&
              <Scrollbar sx={{ minHeight: 444 }}>
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
                        dataFiltered.map((row) => row.id.toString()),
                      )
                    }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage,
                      )
                      .map((row) => (
                        <CashFlowTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id.toString())}
                          onSelectRow={() => table.onSelectRow(row.id.toString())}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          detailsHref={paths.dashboard.cashFlow.details(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
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
    {renderMoneyMovementDialog()}
    </>
  )
    ;
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: ICashFlowItem[];
  filters: ICashFlowTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { status, name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // if (name) {
  //   inputData = inputData.filter(({ orderNumber, customer }) =>
  //     [orderNumber, customer.name, customer.email].some((field) =>
  //       field?.toLowerCase().includes(name.toLowerCase())
  //     )
  //   );
  // }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.type === status);
  }

  // if (!dateError) {
  //   if (startDate && endDate) {
  //     inputData = inputData.filter((order) => fIsBetween(order.createdAt, startDate, endDate));
  //   }
  // }

  return inputData;
}
