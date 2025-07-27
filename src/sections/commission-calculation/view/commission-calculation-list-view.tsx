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

import { isAdmin } from 'src/utils/roles.mapper';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTable, getComparator } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from '../../../auth/hooks';
import { GridActionsLinkItem } from '../../product/view';
import { EmptyContent } from '../../../components/empty-content';
import { propertyColumns } from '../../../utils/columns/property-columns';
import { PropertyGridTableToolbar } from '../../property/property-table-toolbar';
import { restoreProperty,
  deleteManyProperties, updatePropertyStatus, updatePropertyFeatured, useGetPropertiesForCommission,
} from '../../../actions/property';

import type { IPropertyItemPreview, IPropertyDataFilters } from '../../../types/property';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'concretized', label: 'Concretado' },
  { value: 'concretized_fulfill', label: 'Concretado calculado' },
];

// ----------------------------------------------------------------------

export function CommissionCalculationListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 25, defaultOrderBy: 'id' });
  const confirmDialog = useBoolean();
  const downloadImagesLoading = useBoolean();
  const { properties, refresh, propertiesLoading } = useGetPropertiesForCommission  ();
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

  const handleReturnRowToListing = async (id: string) => {
    const promise = await (async () => {
      const response: AxiosResponse<any> = await updatePropertyStatus(id, 'active');
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
          heading="Calculo de comisiones"
          links={[
            { name: 'Inicio', href: paths.dashboard.root },
            { name: 'Calculo de comisiones' },
          ]}
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
                      (tab.value === 'concretized' && 'info') ||
                      (tab.value === 'concretized_fulfill' && 'success') ||
                      'default'
                    }
                  >
                    {['concretized', 'concretized_fulfill'].includes(tab.value)
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
              checkboxSelection={isAdmin(user.role)}
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
                    // ...(params.row.status !== 'deleted' && (canEditProperties(user.role) || params.row.realStateAdviser == user.id)
                    //     ? [
                    //       <GridActionsLinkItem
                    //         showInMenu
                    //         icon={<Iconify icon="eva:edit-2-fill" />}
                    //         label="Editar"
                    //         href={paths.dashboard.properties.edit(params.row.id)}
                    //       />
                    //     ] : []
                    // ),
                    // ...(params.row.status === 'active'
                    // ? [
                    //       <GridActionsCellItem
                    //         showInMenu
                    //         icon={<Iconify icon="material-symbols:share" />}
                    //         onClick={() => handleShareContent(params.row.slug, params.row.publicationTitle)}
                    //         label="Compartir"
                    //       />,
                    //     ] : []
                    // ),
                    ...(isAdmin(user.role)
                      ? [
                        <GridActionsLinkItem
                          showInMenu
                          icon={<Iconify icon="material-symbols:calculate" />}
                          label="Calcular comision"
                          href={paths.dashboard.admin.commissionsCalculate(params.row.id)}
                        />,
                        <GridActionsCellItem
                          showInMenu
                          icon={<Iconify icon="lets-icons:back" />}
                          label="Cancelar concretado"
                          onClick={() => handleReturnRowToListing(params.row.id)}
                          sx={{ color: 'error.main' }}
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

  if (status !== 'all') {
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
