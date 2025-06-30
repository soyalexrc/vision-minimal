'use client';

import type { ICloseCashFlowItem } from 'src/types/cashflow';
import type { TableHeadCellProps } from 'src/components/table';

import { useState, useEffect } from 'react';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Stack } from '@mui/material';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetCloseCashFlows } from 'src/actions/cashflow';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { AllyQuickEditForm } from '../../ally/ally-quick-edit-form';
import { CloseCashFlowTableRow } from '../close-cashflow-table-row';

import type { DateFilters } from './cashflow-list-view';
import type { IAllyTableFilters } from '../../../types/ally';

// ----------------------------------------------------------------------


const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'id', label: 'ID' },
  { id: 'date', label: 'Fecha de cierre' },
  { id: 'data', label: 'Data' }
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
  const { data, error, loading, empty, refetch } = useGetCloseCashFlows();

  console.log('CloseCashFlowView', { data, error, loading, empty });

  const [tableData, setTableData] = useState<ICloseCashFlowItem[]>([]);

  useEffect(() => {
    setTableData(data || []);
  }, [data]);

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
            { name: 'Flujo de caja', href: paths.dashboard.cashFlow.list },
            { name: 'Cierre de caja' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack direction="row" gap={2} mb={2}>
          <DatePicker
            label="Desde"
            slotProps={{
              textField: {
                size: 'small',
              }
            }}
            sx={{ width: 200 }}
          />
          <DatePicker
            label="Hasta"
             slotProps={{
              textField: {
                size: 'small',
              }
            }}
            sx={{ width: 200 }}
          />
          <Button  variant="contained" color="primary">
            <Iconify icon="solar:search-bold" />
            Buscar
          </Button>
        </Stack>

        <Card>

          <Box sx={{ position: 'relative' }}>

            {
              loading && (
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
              error && (
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
              !loading && !error && data &&
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headCells={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <CloseCashFlowTableRow
                          key={row.id}
                          row={row}
                        />
                      ))}

                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    {
                      empty && (
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

      {renderQuickCreateForm()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: ICloseCashFlowItem[];
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

  // if (name) {
  //   inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  // }

  // if (status !== 'all') {
    // inputData = inputData.filter((user) => user.status === status);
  // }

  return inputData;
}

