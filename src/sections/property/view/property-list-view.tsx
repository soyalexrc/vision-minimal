
'use client';

import type { AxiosResponse } from 'axios';
import type { GridRowSelectionModel, GridColumnVisibilityModel } from '@mui/x-data-grid';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
import { useTable, getComparator } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from '../../../auth/hooks';
import { RouterLink } from '../../../routes/components';
import { GridActionsLinkItem } from '../../product/view';
import { EmptyContent } from '../../../components/empty-content';
import { PropertyGridTableToolbar } from '../property-table-toolbar';
import { propertyColumns } from '../../../utils/columns/property-columns';
import {
  deleteProperty, restoreProperty,
  useGetProperties, deleteManyProperties, updatePropertyStatus, updatePropertyFeatured,
} from '../../../actions/property';

import type { IPropertyItemPreview, IPropertyDataFilters } from '../../../types/property';

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
  const downloadImagesLoading = useBoolean();
  const { properties, refresh, propertiesLoading } = useGetProperties();
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  const [tableData, setTableData] = useState<IPropertyItemPreview[]>(properties);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const { user } = useAuthContext();
  const filters = useSetState<IPropertyDataFilters>({ name: '', status: 'all', propertyType: [], operationType: [], isFeatured: undefined });

  const { state: currentFilters, setState: updateFilters } = filters;

  const CustomToolbarCallback = useCallback(
    () => (
      <PropertyGridTableToolbar
        filters={filters}
        canReset={canReset}
        onResetPage={table.onResetPage}
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
    propertyColumns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  useEffect(() => {
    if (properties?.length > 0) {
      setTableData(properties);
    }
  }, [properties]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const handleDeleteRow = async (id: string) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await deleteProperty(id);
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

  const handleActiveInactiveProperty = async (id: string, status: 'active' | 'inactive') => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await updatePropertyStatus(id, status);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registro actualizado!',
      error: (error) => error || 'Error al actualizar el registro!',
    });

    refresh();
  };

  const handleShareContent = async (slug: string, title : string) => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: 'Mira estos increíbles inmuebles que te pueden interesar.',
          url: 'https://visioninmobiliaria.com.ve/inmuebles/' + slug, // Gets the current URL
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText('https://visioninmobiliaria.com.ve/inmuebles/' + slug);
      toast.success('Link copiado al portapapeles');
    }
  }

  const handleMarkFeaturedProperty = async (id: string, featured: boolean) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await updatePropertyFeatured(id, featured);
      if (response.status === 200 || response.status === 201) {
        return response.data?.message;
      } else {
        throw new Error(response.data?.message);
      }
    })();

    toast.promise(promise, {
      loading: 'Cargando...',
      success: (message: string) => message || 'Registro actualizado!',
      error: (error) => error || 'Error al actualizar el registro!',
    });

    refresh();
  };

  async function handleDownloadAssets(images: string[], code: string) {
    const zip = new JSZip();

    const t = toast.loading('Se estan descargando las imagenes de el inmueble');
    downloadImagesLoading.onTrue();
    for (let i = 0; i < images.length; i++) {
      try {
        // const imageRef = ref(storage, images[i]);
        // const blob = await getBlob(imageRef);
        const response = await fetch(images[i]);
        const blob = await response.blob();
        zip.file(`${code}-${i + 1}.jpg`, blob);
      } catch (error) {
        console.error('Error downloading image:', images[i], error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `IMAGENES_${code}.zip`);
    toast.dismiss(t);
    downloadImagesLoading.onFalse();
    toast.success('Imagenes descargadas con exito!');
  }

  const handleRestoreRow = async (id: string) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await restoreProperty(id);
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
      const response: AxiosResponse<any> = await deleteManyProperties(selectedRowIds as string[]);
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
      if (newValue === 'featured') {
        updateFilters({ isFeatured: true, status: 'featured' });
      } else {
        updateFilters({ status: newValue, isFeatured: undefined });
      }
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
          Estas seguro de eliminar <strong> {selectedRowIds.length} </strong> inmueble(s)?
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
              href={paths.dashboard.properties.create}
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
                      ? tableData.filter((property) => property.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
            <Tab value="featured" label="Destacado" iconPosition="end"  icon={
              <Label
                variant={
                  ((currentFilters.isFeatured) && 'filled') ||
                  'soft'
                }
                color="warning"
              >
                {tableData.filter((property) => property.isFeatured).length}
              </Label>
            }/>
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
              getRowId={(params) => params.id}
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
                      href={paths.dashboard.properties.details(params.row.id)}
                    />,


                    <GridActionsCellItem
                      showInMenu
                      disabled={downloadImagesLoading.value}
                      icon={<Iconify icon="lucide:image-down" />}
                      onClick={() => handleDownloadAssets(params.row.images, params.row.code)}
                      label="Descargar imagenes"
                    />,
                    ...(params.row.status !== 'deleted' && (user.role !== 'ASESOR_INMOBILIARIO' || params.row.realStateAdviser == user.id)
                        ? [
                          <GridActionsLinkItem
                            showInMenu
                            icon={<Iconify icon="eva:edit-2-fill" />}
                            label="Editar"
                            href={paths.dashboard.properties.edit(params.row.id)}
                          />
                        ] : []
                    ),
                    ...(params.row.status === 'active'
                    ? [
                          <GridActionsCellItem
                            showInMenu
                            icon={<Iconify icon="material-symbols:share" />}
                            onClick={() => handleShareContent(params.row.slug, params.row.publicationTitle)}
                            label="Compartir"
                          />,
                        ] : []
                    ),
                    ...(params.row.status === 'active' && user.role !== 'ASESOR_INMOBILIARIO'
                    ? [
                          <GridActionsCellItem
                            showInMenu
                            icon={<Iconify icon={params.row.isFeatured ? 'uis:favorite' : "uit:favorite"} />}
                            label={params.row.isFeatured ? 'Desmarcar destacado' : 'Marcar destacado'}
                            onClick={() => handleMarkFeaturedProperty(params.row.id, !params.row.isFeatured)}
                            sx={{ color: 'warning.main' }}
                          />,
                          <GridActionsCellItem
                            showInMenu
                            icon={<Iconify icon="lets-icons:check-fill" />}
                            label="Marcar como activo"
                            onClick={() => handleActiveInactiveProperty(params.row.id, 'active')}
                            sx={{ color: 'success.main' }}
                          />,
                          <GridActionsCellItem
                            showInMenu
                            icon={<Iconify icon="lsicon:disable-outline" />}
                            label="Marcar como inactivo"
                            onClick={() => handleActiveInactiveProperty(params.row.id, 'inactive')}
                            sx={{ color: 'warning.main' }}
                          />,
                        ] : []
                    ),
                    ...(params.row.status !== 'deleted' && user.role !== 'ASESOR_INMOBILIARIO'
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
                ...propertyColumns,
              ]}
              loading={propertiesLoading}
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
          {/*    propertiesLoading &&*/}
          {/*    <Box sx={{ height: 400, justifyContent: 'center', alignItems: 'center' }}>*/}
          {/*      <LoadingScreen />*/}
          {/*    </Box>*/}
          {/*  }*/}

          {/*  {*/}
          {/*    !propertiesLoading && properties.length > 0 &&*/}
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
          {/*              <PropertyTableRow*/}
          {/*                key={row.id}*/}
          {/*                row={row}*/}
          {/*                selected={table.selected.includes(row.id!.toString())}*/}
          {/*                onSelectRow={() => table.onSelectRow(row.id!.toString())}*/}
          {/*                onDeleteRow={() => handleDeleteRow(row.id!.toString())}*/}
          {/*                editHref={paths.dashboard.properties.edit(row.id!)}*/}
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
  inputData: IPropertyItemPreview[];
  filters: IPropertyDataFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, operationType, propertyType, isFeatured } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.publicationTitle.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all' && status !== 'featured') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (isFeatured !== undefined) {
    inputData = inputData.filter((property) => property.isFeatured);
  }

  if (propertyType.length) {
    inputData = inputData.filter((product) => propertyType.includes(product.propertyType));
  }

  if (operationType.length) {
    inputData = inputData.filter((product) => operationType.includes(product.operationType));
  }

  // if (role.length) {
  //   inputData = inputData.filter((user) => role.includes(user.role));
  // }

  return inputData;
}
